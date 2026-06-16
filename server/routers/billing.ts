import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  getAllSubscriptionPlans,
  getSubscriptionPlanBySlug,
  createUserSubscription,
  getUserCurrentSubscription,
  getCurrentMonthUsage,
  canUserGeneratePosts,
  savePost,
  getUserSavedPosts,
  deleteSavedPost,
  getUserPaymentHistory,
  getWhitelabelSettings,
  updateWhitelabelSettings,
  recordPayment,
  initializeSubscriptionPlans,
} from "../db-billing";
import { getDb } from "../db";
import { userSubscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const billingRouter = router({
  /**
   * Get all available subscription plans
   */
  getPlans: protectedProcedure.query(async () => {
    const plans = await getAllSubscriptionPlans();
    return plans.map((plan) => ({
      ...plan,
      languages: JSON.parse(plan.languages || "[]"),
      features: JSON.parse(plan.features || "[]"),
    }));
  }),

  /**
   * Get current user's subscription
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserCurrentSubscription(ctx.user.id);
    if (!subscription) return null;

    const db = await getDb();
    if (!db) return null;

    const plan = await db
      .select()
      .from(require("../../drizzle/schema").subscriptionPlans)
      .where(
        eq(require("../../drizzle/schema").subscriptionPlans.id, subscription.planId)
      )
      .limit(1);

    return {
      ...subscription,
      plan: plan[0],
    };
  }),

  /**
   * Get current usage for this month
   */
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserCurrentSubscription(ctx.user.id);
    if (!subscription) return { used: 0, limit: 0, remaining: 0 };

    const db = await getDb();
    if (!db) return { used: 0, limit: 0, remaining: 0 };

    const plan = await db
      .select()
      .from(require("../../drizzle/schema").subscriptionPlans)
      .where(
        eq(require("../../drizzle/schema").subscriptionPlans.id, subscription.planId)
      )
      .limit(1);

    const used = await getCurrentMonthUsage(ctx.user.id);
    const limit = plan[0]?.postsPerMonth || 0;
    const remaining = Math.max(0, limit - used);

    return { used, limit, remaining };
  }),

  /**
   * Check if user can generate posts
   */
  canGenerate: protectedProcedure.query(async ({ ctx }) => {
    return await canUserGeneratePosts(ctx.user.id);
  }),

  /**
   * Upgrade to a plan
   */
  upgradePlan: protectedProcedure
    .input(z.object({ planSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await getSubscriptionPlanBySlug(input.planSlug);
      if (!plan) throw new Error("Plan not found");

      // Check if user already has a subscription
      const existing = await getUserCurrentSubscription(ctx.user.id);

      const db = await getDb();
      if (!db) throw new Error("Database error");

      if (existing) {
        // Update existing subscription
        await db
          .update(userSubscriptions)
          .set({
            planId: plan.id,
            status: "active",
            startDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptions.id, existing.id));
      } else {
        // Create new subscription
        await createUserSubscription(ctx.user.id, plan.id);
      }

      // Record payment
      await recordPayment({
        userId: ctx.user.id,
        subscriptionId: existing?.id,
        amount: plan.price,
        currency: plan.currency,
        status: "completed",
        description: `Subscription to ${plan.name} plan`,
      });

      return { success: true, plan };
    }),

  /**
   * Save a post
   */
  savePost: protectedProcedure
    .input(
      z.object({
        businessName: z.string(),
        businessType: z.string(),
        platform: z.string(),
        language: z.string(),
        headline: z.string().optional(),
        subheadline: z.string().optional(),
        cta: z.string().optional(),
        caption: z.string().optional(),
        hashtags: z.string().optional(),
        imageUrl: z.string().optional(),
        imageData: z.string().optional(),
        brandColor: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await savePost({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true }
    }),

  /**
   * Get user's saved posts
   */
  getSavedPosts: protectedProcedure.query(async ({ ctx }) => {
    return await getUserSavedPosts(ctx.user.id);
  }),

  /**
   * Delete saved post
   */
  deleteSavedPost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteSavedPost(input.postId, ctx.user.id);
      return { success: true };
    }),

  /**
   * Get payment history
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    return await getUserPaymentHistory(ctx.user.id);
  }),

  /**
   * Get whitelabel settings
   */
  getWhitelabelSettings: protectedProcedure.query(async ({ ctx }) => {
    return await getWhitelabelSettings(ctx.user.id);
  }),

  /**
   * Update whitelabel settings
   */
  updateWhitelabelSettings: protectedProcedure
    .input(
      z.object({
        brandName: z.string().optional(),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        customDomain: z.string().optional(),
        hideBranding: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateWhitelabelSettings(ctx.user.id, {
        ...input,
        hideBranding: input.hideBranding ? 1 : 0,
      });
      return { success: true };
    }),

  /**
   * Initialize subscription plans (admin only)
   */
  initializePlans: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin only");
    }
    await initializeSubscriptionPlans();
    return { success: true };
  }),
});
