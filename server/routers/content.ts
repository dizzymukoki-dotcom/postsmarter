import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

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
  generatePost: publicProcedure
    .input(generatePostInputSchema)
    .mutation(async ({ input }: { input: z.infer<typeof generatePostInputSchema> }) => {
      const systemPrompt = buildSystemPrompt(input.language, input.businessType);
      const userPrompt = buildUserPrompt(input);

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent) || "";
        
        // Parse the AI response to extract structured data
        const parsedContent = parseAIResponse(content);

        return {
          success: true,
          content: parsedContent,
          rawContent: content,
        };
      } catch (error) {
        console.error("[Content Generation] LLM Error:", error);
        
        // Fallback to template-based generation if LLM fails
        const fallbackContent = generateFallbackContent(input);
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
        count: posts.length,
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
  } catch (e) {
    console.warn("[Content Parse] Failed to parse JSON, using raw content");
  }

  // Fallback: return the raw content as caption
  return {
    headline: "Amazing Offer",
    subheadline: "Limited Time",
    cta: "Learn More",
    hashtags: "#ZimBusiness",
    caption: content,
  };
}

function generateFallbackContent(input: {
  businessName: string;
  businessType: string;
  platform: string;
  language: string;
  headline: string;
  subheadline: string;
  cta: string;
  hashtags?: string;
}): Record<string, string> {
  const fallbackTemplates = {
    english: {
      caption: `Discover what makes ${input.businessName} special! ${input.subheadline}. ${input.cta} today!`,
    },
    shona: {
      caption: `Muwone zvakaisvika kune ${input.businessName}! ${input.subheadline}. ${input.cta} nhasi!`,
    },
    ndebele: {
      caption: `Bona okukulu kwe${input.businessName}! ${input.subheadline}. ${input.cta} namhlanje!`,
    },
  };

  const template = fallbackTemplates[input.language as keyof typeof fallbackTemplates] || fallbackTemplates.english;

  return {
    headline: input.headline,
    subheadline: input.subheadline,
    cta: input.cta,
    hashtags: input.hashtags || "#ZimBusiness #SupportLocal",
    caption: template.caption,
  };
}
