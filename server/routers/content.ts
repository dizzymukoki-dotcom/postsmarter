import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
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
  generatePost: publicProcedure
    .input(generatePostInputSchema)
    .mutation(async ({ ctx, input }: { ctx: any; input: z.infer<typeof generatePostInputSchema> }) => {
      // Check subscription limits only if user is logged in
      if (ctx.user) {
        const canGenerate = await canUserGeneratePosts(ctx.user.id);
        if (!canGenerate.canGenerate) {
          throw new Error(canGenerate.reason || "Cannot generate posts");
        }
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

        // Track usage if user is logged in
        if (ctx.user) {
          await trackPostGeneration(ctx.user.id, 1);
        }

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
        
        // Track usage if user is logged in
        if (ctx.user) {
          await trackPostGeneration(ctx.user.id, 1);
        }
        
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
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      // Check subscription limits only if user is logged in
      if (ctx.user) {
        const canGenerate = await canUserGeneratePosts(ctx.user.id);
        if (!canGenerate.canGenerate) {
          throw new Error(canGenerate.reason || "Cannot generate posts");
        }
      }

      const posts = [];

      for (let i = 0; i < input.count; i++) {
        try {
          const systemPrompt = buildSystemPrompt(input.language, input.businessType);
          const userPrompt = `Generate a unique social media post for ${input.businessName} (${input.businessType}) for ${input.platform}. This is variation ${i + 1} of ${input.count}. Make it different from previous variations.`;

          const imagePrompt = `Professional marketing image for ${input.businessName} (${input.businessType}). Variation ${i + 1}. High quality, modern design.`;

          const [response, imageResult] = await Promise.all([
            invokeLLM({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
            }),
            generateImage({ prompt: imagePrompt }).catch(() => null),
          ]);

          const messageContent = response.choices[0]?.message?.content;
          const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent) || "";
          const parsedContent = parseAIResponse(content);

          posts.push({
            success: true,
            content: parsedContent,
            rawContent: content,
            imageUrl: imageResult?.url,
          });
        } catch (error) {
          console.error(`[Bulk Generation] Error on post ${i + 1}:`, error);
          const fallbackContent = generateFallbackContent({
            businessName: input.businessName,
            businessType: input.businessType,
            platform: input.platform,
            language: input.language,
            headline: `Offer ${i + 1}`,
            subheadline: "Limited Time",
            cta: "Shop Now",
          });

          posts.push({
            success: true,
            content: fallbackContent,
            rawContent: JSON.stringify(fallbackContent),
            isFallback: true,
          });
        }
      }

      // Track usage if user is logged in
      if (ctx.user) {
        await trackPostGeneration(ctx.user.id, input.count);
      }

      return {
        success: true,
        posts,
      };
    }),
});

// Helper functions
function buildSystemPrompt(language: string, businessType: string): string {
  const languageGuides: Record<string, string> = {
    english: "Create engaging, professional social media content in English.",
    shona: "Create engaging social media content in Shona language. Use natural Shona expressions and cultural references relevant to Zimbabwe.",
    ndebele: "Create engaging social media content in Ndebele language. Use natural Ndebele expressions and cultural references relevant to Zimbabwe.",
  };

  return `You are an expert social media copywriter specializing in ${businessType} marketing for ${language.charAt(0).toUpperCase() + language.slice(1)} audiences in Zimbabwe.

${languageGuides[language] || languageGuides.english}

Generate compelling, culturally-appropriate social media posts that drive engagement and conversions. Format your response as valid JSON with these fields:
- headline: Catchy main message (max 10 words)
- subheadline: Supporting message (max 15 words)
- cta: Clear call-to-action (max 8 words)
- hashtags: Array of relevant hashtags (5-8 tags)
- caption: Full post copy (100-200 words)`;
}

function buildUserPrompt(input: z.infer<typeof generatePostInputSchema>): string {
  return `Create a social media post for:
Business: ${input.businessName}
Type: ${input.businessType}
Platform: ${input.platform}
Language: ${input.language}
Headline: ${input.headline}
Subheadline: ${input.subheadline}
CTA: ${input.cta}
Hashtags: ${input.hashtags || "auto-generate relevant ones"}

Make it engaging, professional, and optimized for ${input.platform}. Ensure cultural relevance for Zimbabwe.`;
}

function buildImagePrompt(input: z.infer<typeof generatePostInputSchema>): string {
  return `Professional marketing image for ${input.businessName} (${input.businessType}). ${input.headline}. High quality, modern design, suitable for ${input.platform}. Include relevant visual elements that appeal to ${input.language}-speaking audiences in Zimbabwe.`;
}

function parseAIResponse(content: string): any {
  try {
    // Try to extract JSON from markdown code blocks first
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    
    const parsed = JSON.parse(jsonStr);
    
    return {
      headline: String(parsed.headline || ""),
      subheadline: String(parsed.subheadline || ""),
      cta: String(parsed.cta || ""),
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : (typeof parsed.hashtags === "string" ? parsed.hashtags.split(" ") : []),
      caption: String(parsed.caption || ""),
    };
  } catch (error) {
    console.error("[Parse Error]", error);
    return generateFallbackContent({
      businessName: "Your Business",
      businessType: "Business",
      platform: "instagram",
      language: "english",
      headline: "Amazing Offer",
      subheadline: "Limited Time",
      cta: "Shop Now",
    });
  }
}

function generateFallbackContent(input: any): any {
  const templates: Record<string, any> = {
    "Restaurant / Fast Food": {
      headline: "Hungry? We've Got You!",
      subheadline: "Fresh, delicious food ready now",
      cta: "Order Today",
      caption: `Craving something delicious? ${input.businessName} is serving up the best ${input.businessType.toLowerCase()} in town! Fresh ingredients, amazing flavors, and fast service. Your taste buds will thank you! 🍽️`,
      hashtags: ["#FoodLover", "#LocalEats", "#FreshFood", "#YumYum"],
    },
    "Retail / Shopping": {
      headline: "Shop Smart, Save Big",
      subheadline: "Exclusive deals just for you",
      cta: "Shop Now",
      caption: `Discover amazing products at ${input.businessName}! From fashion to essentials, we have everything you need. Quality products at unbeatable prices. Don't miss out! 🛍️`,
      hashtags: ["#Shopping", "#Deals", "#Fashion", "#ShopLocal"],
    },
    "Nightlife / Entertainment": {
      headline: "Your Night Starts Here",
      subheadline: "The best vibes in town",
      cta: "Reserve Now",
      caption: `Looking for an unforgettable night out? ${input.businessName} is the place to be! Great music, amazing atmosphere, and good company. Come celebrate with us! 🎉`,
      hashtags: ["#Nightlife", "#Entertainment", "#Party", "#GoodTimes"],
    },
    default: {
      headline: input.headline || "Amazing Offer",
      subheadline: input.subheadline || "Limited Time Only",
      cta: input.cta || "Shop Now",
      caption: `Check out ${input.businessName}! We offer the best ${input.businessType.toLowerCase()} experience. Don't miss out on our special offers!`,
      hashtags: ["#Business", "#LocalSupport", "#Quality", "#BestDeal"],
    },
  };

  const template = templates[input.businessType] || templates.default;
  return {
    headline: template.headline,
    subheadline: template.subheadline,
    cta: template.cta,
    caption: template.caption,
    hashtags: template.hashtags,
  };
}
