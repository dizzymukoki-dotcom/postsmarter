import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  subscriptionPlans,
  userSubscriptions,
  usageTracking,
  savedPosts,
  payments,
  whitelabelSettings,
  InsertUserSubscription,
  InsertUsageTracking,
  InsertSavedPost,
  InsertPayment,
  InsertWhitelabelSettings,
} from "../drizzle/schema";

/**
 * Initialize default subscription plans
 */
export async function initializeSubscriptionPlans() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const plans = [
    {
      name: "Starter",
      slug: "starter",
      price: 2900, // $29
      currency: "USD",
      postsPerMonth: 10,
      languages: JSON.stringify(["english"]),
      features: JSON.stringify(["basic_generation", "english_only"]),
      whitelabel: 0,
    },
    {
      name: "Pro",
      slug: "pro",
      price: 9900, // $99
      currency: "USD",
      postsPerMonth: 50,
      languages: JSON.stringify(["english", "shona", "ndebele"]),
      features: JSON.stringify([
        "full_generation",
        "all_languages",
        "saved_posts",
        "custom_colors",
      ]),
      whitelabel: 0,
    },
    {
      name: "Agency",
      slug: "agency",
      price: 49900, // $499
      currency: "USD",
      postsPerMonth: 999, // Unlimited
      languages: JSON.stringify(["english", "shona", "ndebele"]),
      features: JSON.stringify([
        "unlimited_generation",
        "all_languages",
        "saved_posts",
        "custom_colors",
        "whitelabel",
        "team_access",
        "api_access",
      ]),
      whitelabel: 1,
    },
  ];

  for (const plan of plans) {
    try {
      await db.insert(subscriptionPlans).values(plan as any).onDuplicateKeyUpdate({
        set: plan as any,
      });
    } catch (error) {
      console.warn(`Plan ${plan.slug} already exists`);
    }
  }
}

/**
 * Get subscription plan by slug
 */
export async function getSubscriptionPlanBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.slug, slug))
    .limit(1);

  return result[0] || null;
}

/**
 * Get all subscription plans
 */
export async function getAllSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptionPlans);
}

/**
 * Create or upgrade user subscription
 */
export async function createUserSubscription(
  userId: number,
  planId: number,
  trialDays: number = 14
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  const subscription: InsertUserSubscription = {
    userId,
    planId,
    status: "trial",
    startDate: new Date(),
    trialEndsAt,
  };

  const result = await db.insert(userSubscriptions).values(subscription);
  return result;
}

/**
 * Get user's active subscription
 */
export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, "active")
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get user's current subscription (active or trial)
 */
export async function getUserCurrentSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(userSubscriptions.createdAt)
    .limit(1);

  return result[0] || null;
}

/**
 * Track post generation usage
 */
export async function trackPostGeneration(userId: number, count: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Find or create usage record for this month
  const existing = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.year, year),
        eq(usageTracking.month, month)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(usageTracking)
      .set({
        postsGenerated: existing[0].postsGenerated + count,
        updatedAt: new Date(),
      })
      .where(eq(usageTracking.id, existing[0].id));
  } else {
    // Create new
    const usage: InsertUsageTracking = {
      userId,
      year,
      month,
      postsGenerated: count,
    };
    await db.insert(usageTracking).values(usage);
  }
}

/**
 * Get current month usage for user
 */
export async function getCurrentMonthUsage(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const result = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.year, year),
        eq(usageTracking.month, month)
      )
    )
    .limit(1);

  return result[0]?.postsGenerated || 0;
}

/**
 * Save a generated post
 */
export async function savePost(data: InsertSavedPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(savedPosts).values(data);
  return result;
}

/**
 * Get user's saved posts
 */
export async function getUserSavedPosts(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(savedPosts)
    .where(eq(savedPosts.userId, userId))
    .orderBy(savedPosts.createdAt);
}

/**
 * Delete saved post
 */
export async function deleteSavedPost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(savedPosts)
    .where(and(eq(savedPosts.id, postId), eq(savedPosts.userId, userId)));
}

/**
 * Record payment
 */
export async function recordPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  return result;
}

/**
 * Get user's payment history
 */
export async function getUserPaymentHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(payments.createdAt);
}

/**
 * Get or create whitelabel settings
 */
export async function getWhitelabelSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(whitelabelSettings)
    .where(eq(whitelabelSettings.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Update whitelabel settings
 */
export async function updateWhitelabelSettings(
  userId: number,
  data: Partial<InsertWhitelabelSettings>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getWhitelabelSettings(userId);

  if (existing) {
    await db
      .update(whitelabelSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(whitelabelSettings.userId, userId));
  } else {
    await db.insert(whitelabelSettings).values({
      userId,
      ...data,
    } as any);
  }
}

/**
 * Check if user can generate posts (within quota)
 */
export async function canUserGeneratePosts(userId: number): Promise<{
  canGenerate: boolean;
  reason?: string;
  remaining?: number;
}> {
  const subscription = await getUserCurrentSubscription(userId);

  if (!subscription) {
    return { canGenerate: false, reason: "No active subscription" };
  }

  // Check if trial or subscription is still valid
  if (subscription.status === "trial" && subscription.trialEndsAt) {
    if (new Date() > subscription.trialEndsAt) {
      return { canGenerate: false, reason: "Trial expired" };
    }
  } else if (subscription.status !== "active") {
    return { canGenerate: false, reason: "Subscription not active" };
  }

  // Get plan details
  const db = await getDb();
  if (!db) return { canGenerate: false, reason: "Database error" };

  const plan = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, subscription.planId))
    .limit(1);

  if (!plan[0]) {
    return { canGenerate: false, reason: "Plan not found" };
  }

  // Check usage
  const usage = await getCurrentMonthUsage(userId);
  const remaining = plan[0].postsPerMonth - usage;

  if (remaining <= 0) {
    return { canGenerate: false, reason: "Monthly quota exceeded" };
  }

  return { canGenerate: true, remaining };
}
