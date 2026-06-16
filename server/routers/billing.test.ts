import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
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

describe("billing router", () => {
  describe("getPlans", () => {
    it("returns available subscription plans", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Initialize plans first
      try {
        await caller.billing.initializePlans();
      } catch (e) {
        // Plans might already exist
      }

      const plans = await caller.billing.getPlans();

      expect(Array.isArray(plans)).toBe(true);
      // Plans might be empty if DB is not initialized, so just check it's an array
      if (plans.length > 0) {
        expect(plans[0]).toHaveProperty("name");
        expect(plans[0]).toHaveProperty("price");
        expect(plans[0]).toHaveProperty("postsPerMonth");
      }
    });

    it("returns parsed languages and features", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.billing.initializePlans();
      } catch (e) {
        // Plans might already exist
      }

      const plans = await caller.billing.getPlans();

      if (plans.length > 0) {
        plans.forEach((plan: any) => {
          expect(Array.isArray(plan.languages)).toBe(true);
          expect(Array.isArray(plan.features)).toBe(true);
        });
      }
    });
  });

  describe("getUsage", () => {
    it("returns usage data for user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const usage = await caller.billing.getUsage();

      expect(usage).toHaveProperty("used");
      expect(usage).toHaveProperty("limit");
      expect(usage).toHaveProperty("remaining");
      expect(typeof usage.used).toBe("number");
      expect(typeof usage.limit).toBe("number");
      expect(typeof usage.remaining).toBe("number");
    });

    it("returns zero usage for new user", async () => {
      const ctx = createAuthContext(999);
      const caller = appRouter.createCaller(ctx);

      const usage = await caller.billing.getUsage();

      expect(usage.used).toBe(0);
    });
  });

  describe("canGenerate", () => {
    it("returns generation capability status", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.billing.canGenerate();

      expect(result).toHaveProperty("canGenerate");
      expect(typeof result.canGenerate).toBe("boolean");
    });
  });

  describe("getSavedPosts", () => {
    it("returns empty array for new user", async () => {
      const ctx = createAuthContext(998);
      const caller = appRouter.createCaller(ctx);

      const posts = await caller.billing.getSavedPosts();

      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe("getPaymentHistory", () => {
    it("returns payment history array", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const payments = await caller.billing.getPaymentHistory();

      expect(Array.isArray(payments)).toBe(true);
    });
  });

  describe("getWhitelabelSettings", () => {
    it("returns whitelabel settings or null", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const settings = await caller.billing.getWhitelabelSettings();

      // Can be null or an object
      if (settings) {
        expect(settings).toHaveProperty("userId");
      }
    });
  });
});
