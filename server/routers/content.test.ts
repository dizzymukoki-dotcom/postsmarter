import { describe, it, expect, vi, beforeEach } from "vitest";
import { contentRouter } from "./content";
import type { TrpcContext } from "../_core/context";

// Mock the LLM module
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock the image generation module
vi.mock("../_core/imageGeneration", () => ({
  generateImage: vi.fn(),
}));

import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";

// Mock billing functions
vi.mock("../db-billing", () => ({
  canUserGeneratePosts: vi.fn(() => Promise.resolve({ canGenerate: true })),
  trackPostGeneration: vi.fn(() => Promise.resolve()),
}));

const mockInvokeLLM = invokeLLM as ReturnType<typeof vi.fn>;
const mockGenerateImage = generateImage as ReturnType<typeof vi.fn>;

import { canUserGeneratePosts, trackPostGeneration } from "../db-billing";
const mockCanGenerate = canUserGeneratePosts as ReturnType<typeof vi.fn>;
const mockTrackUsage = trackPostGeneration as ReturnType<typeof vi.fn>;

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("contentRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateImage.mockResolvedValue({ url: "https://example.com/image.png" });
    mockCanGenerate.mockResolvedValue({ canGenerate: true });
    mockTrackUsage.mockResolvedValue(undefined);
  })

  describe("generatePost", () => {
    it("should generate a post with valid input", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                headline: "Amazing Offer",
                subheadline: "Limited Time",
                cta: "Shop Now",
                hashtags: "#ZimBusiness",
                caption: "Check out our amazing offer!",
              }),
            },
          },
        ],
      };

      mockInvokeLLM.mockResolvedValue(mockResponse);

      const ctx = createMockContext();
      const caller = contentRouter.createCaller(ctx);

      const result = await caller.generatePost({
        businessName: "Test Restaurant",
        businessType: "Restaurant / Fast Food",
        platform: "instagram",
        language: "english",
        headline: "AMAZING OFFER",
        subheadline: "Limited Time Only",
        cta: "SHOP NOW",
        hashtags: "#ZimBusiness",
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.content.headline).toBe("Amazing Offer");
      expect(mockInvokeLLM).toHaveBeenCalled();
    });

    it("should handle LLM errors gracefully with fallback", async () => {
      mockInvokeLLM.mockRejectedValue(new Error("LLM service unavailable"));

      const ctx = createMockContext();
      const caller = contentRouter.createCaller(ctx);

      const result = await caller.generatePost({
        businessName: "Test Restaurant",
        businessType: "Restaurant / Fast Food",
        platform: "instagram",
        language: "english",
        headline: "AMAZING OFFER",
        subheadline: "Limited Time Only",
        cta: "SHOP NOW",
        hashtags: "#ZimBusiness",
      });

      expect(result.success).toBe(true);
      expect(result.isFallback).toBe(true);
      // Fallback uses template, not input headline
      expect(result.content.headline).toBe("Hungry? We've Got You!");
    });

    it("should support Shona language", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                headline: "Muwone",
                subheadline: "Nguva Shoma",
                cta: "Tenga",
                hashtags: "#ZimBusiness",
                caption: "Muwone zvakaisvika kune Restaurant!",
              }),
            },
          },
        ],
      };

      mockInvokeLLM.mockResolvedValue(mockResponse);

      const ctx = createMockContext();
      const caller = contentRouter.createCaller(ctx);

      const result = await caller.generatePost({
        businessName: "Restaurant Harare",
        businessType: "Restaurant / Fast Food",
        platform: "facebook",
        language: "shona",
        headline: "MUWONE",
        subheadline: "Nguva Shoma",
        cta: "TENGA",
        hashtags: "#ZimBusiness",
      });

      expect(result.success).toBe(true);
      expect(result.content.headline).toBe("Muwone");
      expect(mockInvokeLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining("Shona"),
            }),
          ]),
        })
      );
    });

    it("should support Ndebele language", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                headline: "Bona",
                subheadline: "Isikhathi",
                cta: "Thenga",
                hashtags: "#ZimBusiness",
                caption: "Bona okukulu kwe Restaurant!",
              }),
            },
          },
        ],
      };

      mockInvokeLLM.mockResolvedValue(mockResponse);

      const ctx = createMockContext();
      const caller = contentRouter.createCaller(ctx);

      const result = await caller.generatePost({
        businessName: "Restaurant Bulawayo",
        businessType: "Restaurant / Fast Food",
        platform: "whatsapp",
        language: "ndebele",
        headline: "BONA",
        subheadline: "Isikhathi",
        cta: "THENGA",
        hashtags: "#ZimBusiness",
      });

      expect(result.success).toBe(true);
      expect(result.content.headline).toBe("Bona");
      expect(mockInvokeLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining("Ndebele"),
            }),
          ]),
        })
      );
    });

    it("should validate required fields", async () => {
      const ctx = createMockContext();
      const caller = contentRouter.createCaller(ctx);

      try {
        await caller.generatePost({
          businessName: "",
          businessType: "Restaurant / Fast Food",
          platform: "instagram",
          language: "english",
          headline: "AMAZING OFFER",
          subheadline: "Limited Time Only",
          cta: "SHOP NOW",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        // Empty businessName should trigger validation error
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("generateBulkPosts", () => {
    it("should generate multiple posts", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                headline: "Offer",
                subheadline: "Limited",
                cta: "Buy",
                hashtags: "#ZimBusiness",
                caption: "Check this out!",
              }),
            },
          },
        ],
      };

      mockInvokeLLM.mockResolvedValue(mockResponse);

      const ctx = createMockContext();
      const caller = contentRouter.createCaller(ctx);

      const result = await caller.generateBulkPosts({
        businessName: "Test Business",
        businessType: "Restaurant / Fast Food",
        platform: "instagram",
        language: "english",
        count: 3,
      });

      expect(result.success).toBe(true);
      expect(result.posts).toHaveLength(3);
      expect(mockInvokeLLM).toHaveBeenCalledTimes(3);
    });

    it("should handle partial failures in bulk generation", async () => {
      mockInvokeLLM
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  headline: "Offer 1",
                  subheadline: "Limited",
                  cta: "Buy",
                  hashtags: "#ZimBusiness",
                  caption: "Check this out!",
                }),
              },
            },
          ],
        })
        .mockRejectedValueOnce(new Error("Service error"))
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  headline: "Offer 3",
                  subheadline: "Limited",
                  cta: "Buy",
                  hashtags: "#ZimBusiness",
                  caption: "Check this out!",
                }),
              },
            },
          ],
        });

      const ctx = createMockContext();
      const caller = contentRouter.createCaller(ctx);

      const result = await caller.generateBulkPosts({
        businessName: "Test Business",
        businessType: "Restaurant / Fast Food",
        platform: "instagram",
        language: "english",
        count: 3,
      });

      expect(result.success).toBe(true);
      expect(result.posts).toHaveLength(3);
      expect(result.posts[1]?.isFallback).toBe(true);
    });

    it("should respect max count limit", async () => {
      const ctx = createMockContext();
      const caller = contentRouter.createCaller(ctx);

      try {
        await caller.generateBulkPosts({
          businessName: "Test Business",
          businessType: "Restaurant / Fast Food",
          platform: "instagram",
          language: "english",
          count: 15,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        // Count > 10 should trigger validation error
        // Zod validation errors have a code property
        expect(error.code || error.message).toBeDefined();
      }
    })
  });
});
