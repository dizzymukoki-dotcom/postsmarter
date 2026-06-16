import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import { canUserGeneratePosts, trackPostGeneration } from "../db-billing";

const generatePostInputSchema = z.object({
  businessName: z.string().min(1, "Business name required"),
  businessType: z.string().min(1, "Business type required"),
  platform: z.enum(["instagram", "facebook", "tiktok", "whatsapp"]),
  language: z.enum(["english", "shona", "ndebele"]),
  headline: z.string().min(1, "Headline required"),
  subheadline: z.string().min(1, "Subheadline required"),
  cta: z.string().min(1, "Call to action required"),
  hashtags: z.string().optional(),
});

export const contentRouter = router({
  generatePost: protectedProcedure
    .input(generatePostInputSchema)
    .mutation(async ({ ctx, input }: { ctx: any; input: z.infer<typeof generatePostInputSchema> }) => {
      // Check if user can generate posts
      const canGenerate = await canUserGeneratePosts(ctx.user.id);
      if (!canGenerate.canGenerate) {
        throw new Error(canGenerate.reason || "Cannot generate posts");
      }
      const systemPrompt = buildSystemPrompt(input.language, input.businessType);
      const userPrompt = buildUserPrompt(input);

      try {
        // Build image prompt
        const imagePrompt = buildImagePrompt(input);
        
        // Generate AI content and image in parallel
        const [response, imageResult] = await Promise.all([
          invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
          generateImage({ prompt: imagePrompt }).catch((err) => {
            console.warn("[Image Generation] Failed:", err);
            return null;
          }),
        ]);

        const messageContent = response.choices[0]?.message?.content;
        const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent) || "";
        
        // Parse the AI response to extract structured data
        const parsedContent = parseAIResponse(content);

        // Track usage
        await trackPostGeneration(ctx.user.id, 1);

        return {
          success: true,
          content: parsedContent,
          rawContent: content,
          imageUrl: imageResult?.url,
        };
      } catch (error) {
        console.error("[Content Generation] LLM Error:", error);
        
        // Fallback to template-based generation if LLM fails
        const fallbackContent = generateFallbackContent(input);
        
        // Track usage
        await trackPostGeneration(ctx.user.id, 1);
        
        return {
          success: true,
          content: fallbackContent,
          rawContent: JSON.stringify(fallbackContent),
          isFallback: true,
        };
      }
    }),

  generateBulkPosts: publicProcedure
    .input(
      z.object({
        businessName: z.string().min(1),
        businessType: z.string().min(1),
        platform: z.enum(["instagram", "facebook", "tiktok", "whatsapp"]),
        language: z.enum(["english", "shona", "ndebele"]),
        count: z.number().min(1).max(10),
      })
    )
    .mutation(async ({ input }: { input: { businessName: string; businessType: string; platform: "instagram" | "facebook" | "tiktok" | "whatsapp"; language: "english" | "shona" | "ndebele"; count: number } }) => {
      const posts = [];
      
      for (let i = 0; i < input.count; i++) {
        const systemPrompt = buildSystemPrompt(input.language, input.businessType);
        const userPrompt = `Generate a unique ${input.platform} post for ${input.businessName} (${input.businessType}). 
        Make it different from previous posts. Include headline, subheadline, call-to-action, and hashtags.
        Post ${i + 1} of ${input.count}.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          const messageContent = response.choices[0]?.message?.content;
          const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent) || "";
          posts.push({
            id: `post-${i + 1}`,
            content: parseAIResponse(content),
            rawContent: content,
          });
        } catch (error) {
          console.error(`[Bulk Generation] Error generating post ${i + 1}:`, error);
          posts.push({
            id: `post-${i + 1}`,
            content: generateFallbackContent({
              businessName: input.businessName,
              businessType: input.businessType,
              platform: input.platform,
              language: input.language,
              headline: `Post ${i + 1}`,
              subheadline: "Check this out",
              cta: "Learn More",
            }),
            isFallback: true,
          });
        }
      }

      return {
        success: true,
        posts,
      };
    }),
});

// Helper functions

function buildSystemPrompt(language: string, businessType: string): string {
  const languageInstructions = {
    english: `You are a social media expert creating engaging posts in English.
    Focus on clear, punchy messaging that drives engagement and conversions.`,
    shona: `You are an expert in Zimbabwean Shona culture and language. Create authentic, culturally-relevant social media posts in Shona.
    Use natural Shona expressions and idioms. Understand local business practices and consumer behavior.
    Shona is spoken in Zimbabwe and parts of Botswana. Use appropriate tone for the business type.`,
    ndebele: `You are an expert in Zimbabwean Ndebele culture and language. Create authentic, culturally-relevant social media posts in Ndebele.
    Use natural Ndebele expressions and idioms. Understand local business practices and consumer behavior.
    Ndebele is spoken in Zimbabwe. Use appropriate tone for the business type.`,
  };

  const businessContext = {
    "Restaurant / Fast Food": "Focus on food quality, taste, freshness, and convenience. Highlight special offers and delivery.",
    "Bar / Nightlife": "Emphasize ambiance, entertainment, special events, and social experience.",
    "Retail / Shopping": "Highlight products, quality, prices, and shopping convenience.",
    "Finance / Banking": "Emphasize trust, security, financial growth, and customer service.",
    "Telecom / Tech": "Focus on connectivity, innovation, reliability, and customer support.",
    "Healthcare / Wellness": "Emphasize care, health benefits, professional expertise, and customer wellbeing.",
    "Real Estate": "Highlight property features, location benefits, investment potential, and lifestyle.",
    "Education / Training": "Focus on learning outcomes, career advancement, expertise, and student success.",
    "Travel / Tourism": "Emphasize adventure, experiences, destinations, and value for money.",
    "Entertainment / Events": "Highlight entertainment value, exclusivity, fun, and memorable experiences.",
  };

  return `${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.english}

Business Context: ${businessContext[businessType as keyof typeof businessContext] || "General business"}

Create social media posts that:
1. Are culturally appropriate and authentic
2. Drive engagement and conversions
3. Include a compelling headline, subheadline, call-to-action, and hashtags
4. Are formatted as JSON with keys: headline, subheadline, cta, hashtags, caption
5. Keep language natural and conversational`;
}

function buildImagePrompt(input: {
  businessName: string;
  businessType: string;
  platform: "instagram" | "facebook" | "tiktok" | "whatsapp";
  language: "english" | "shona" | "ndebele";
  headline: string;
  subheadline: string;
  cta: string;
  hashtags?: string;
}): string {
  const businessContext: Record<string, string> = {
    "Restaurant / Fast Food": "delicious food, appetizing dishes, restaurant ambiance, pizza, burgers, fresh ingredients",
    "Bar / Nightlife": "vibrant nightlife, party atmosphere, cocktails, entertainment, neon lights, dancing",
    "Retail / Shopping": "modern retail store, shopping bags, stylish products, fashion, boutique",
    "Finance / Banking": "professional finance, trust, security, growth charts, banking, wealth",
    "Telecom / Tech": "modern technology, connectivity, digital innovation, smartphones, tech gadgets",
    "Healthcare / Wellness": "wellness, health, professional healthcare environment, medical, fitness",
    "Real Estate": "beautiful property, modern home, real estate showcase, architecture, luxury",
    "Education / Training": "learning environment, students, education, knowledge, classroom, books",
    "Travel / Tourism": "exotic destination, adventure, beautiful landscape, travel, beaches",
    "Entertainment / Events": "exciting event, entertainment, celebration, fun, party, crowd",
  };

  const context = businessContext[input.businessType] || "professional business";
  
  return `Create a professional, high-quality promotional image for ${input.businessName}, a ${input.businessType} business. The image should feature ${context}. Style: modern, vibrant, professional, eye-catching, suitable for social media. The image should convey the message "${input.headline}" and "${input.subheadline}". Perfect for ${input.platform} marketing. High quality, professional photography style.`;
}

function buildUserPrompt(input: {
  businessName: string;
  businessType: string;
  platform: "instagram" | "facebook" | "tiktok" | "whatsapp";
  language: "english" | "shona" | "ndebele";
  headline: string;
  subheadline: string;
  cta: string;
  hashtags?: string;
}): string {
  return `Create a ${input.platform} post for:
Business: ${input.businessName}
Type: ${input.businessType}
Language: ${input.language}

Use these as inspiration:
- Headline: ${input.headline}
- Subheadline: ${input.subheadline}
- Call-to-Action: ${input.cta}
- Hashtags: ${input.hashtags || "auto-generate relevant ones"}

Generate an authentic, engaging post that resonates with local audiences. Return as JSON.`;
}

function parseAIResponse(content: string): Record<string, string> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        headline: parsed.headline || "Amazing Offer",
        subheadline: parsed.subheadline || "Limited Time",
        cta: parsed.cta || "Learn More",
        hashtags: parsed.hashtags || "#ZimBusiness",
        caption: parsed.caption || content,
      };
    }
  } catch (error) {
    console.error("[Parse] JSON extraction failed:", error);
  }

  // Fallback parsing
  return {
    headline: "Amazing Offer",
    subheadline: "Limited Time Only",
    cta: "Learn More",
    hashtags: "#ZimBusiness #SupportLocal",
    caption: content,
  };
}

function generateFallbackContent(input: {
  businessName: string;
  businessType: string;
  platform: "instagram" | "facebook" | "tiktok" | "whatsapp";
  language: "english" | "shona" | "ndebele";
  headline: string;
  subheadline: string;
  cta: string;
  hashtags?: string;
}): Record<string, string> {
  const fallbacks = {
    english: {
      caption: `Check out ${input.businessName}! We offer the best ${input.businessType.toLowerCase()} experience. Don't miss out!`,
    },
    shona: {
      caption: `Tarisa ${input.businessName}! Isu tinobvisa zvinhu zvakakwana. Regai musi!`,
    },
    ndebele: {
      caption: `Jabulani ${input.businessName}! Sinabonisa izinto ezinhle. Ungalibali!`,
    },
  };

  const fallback = fallbacks[input.language as keyof typeof fallbacks] || fallbacks.english;

  return {
    headline: input.headline,
    subheadline: input.subheadline,
    cta: input.cta,
    hashtags: input.hashtags || "#ZimBusiness #SupportLocal",
    caption: fallback.caption,
  };
}
