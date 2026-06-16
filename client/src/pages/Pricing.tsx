import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Pricing() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  const plansQuery = trpc.billing.getPlans.useQuery();
  const subscriptionQuery = trpc.billing.getSubscription.useQuery();
  const upgradeMutation = trpc.billing.upgradePlan.useMutation({
    onSuccess: (data) => {
      toast.success(`Upgraded to ${data.plan.name}! 🎉`);
      subscriptionQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (subscriptionQuery.data) {
      setCurrentSubscription(subscriptionQuery.data);
    }
  }, [subscriptionQuery.data]);

  const handleUpgrade = (planSlug: string) => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    upgradeMutation.mutate({ planSlug });
  };

  const plans = plansQuery.data || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-yellow-400">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">PS✦</div>
            <div>
              <h1 className="font-bold text-lg">PostSmarter</h1>
              <p className="text-xs text-gray-400">AI Creative Studio</p>
            </div>
          </div>
          <a href="/" className="text-gray-300 hover:text-white">
            ← Back
          </a>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Simple, Transparent <span className="text-yellow-400">Pricing</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the perfect plan for your business. All plans include a 14-day free trial.
            </p>
          </div>

          {/* Current Subscription Info */}
          {currentSubscription && (
            <div className="bg-gray-900 border border-yellow-400 rounded-lg p-6 mb-12 text-center">
              <p className="text-gray-400 mb-2">Current Plan</p>
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                {currentSubscription.plan?.name || "Free Trial"}
              </h3>
              <p className="text-gray-400">
                {currentSubscription.status === "trial"
                  ? "14-day free trial"
                  : `Active until ${new Date(currentSubscription.endDate).toLocaleDateString()}`}
              </p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan: any) => {
              const isCurrentPlan =
                currentSubscription?.plan?.id === plan.id;
              const price = (plan.price / 100).toFixed(2);

              return (
                <div
                  key={plan.id}
                  className={`rounded-lg border-2 transition ${
                    isCurrentPlan
                      ? "border-yellow-400 bg-gray-900 shadow-lg shadow-yellow-400/20"
                      : "border-gray-700 bg-gray-900 hover:border-yellow-400"
                  }`}
                >
                  <div className="p-8">
                    {/* Plan Name */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-gray-400">/month</span>
                      </div>
                    </div>

                    {/* Posts Limit */}
                    <div className="mb-6 pb-6 border-b border-gray-700">
                      <p className="text-lg font-semibold mb-2">
                        {plan.postsPerMonth === 999
                          ? "Unlimited Posts"
                          : `${plan.postsPerMonth} Posts/Month`}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Generate professional social media content
                      </p>
                    </div>

                    {/* Features */}
                    <div className="mb-8 space-y-3">
                      {plan.features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm capitalize">
                            {feature.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Languages */}
                    <div className="mb-8 pb-8 border-b border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">Languages:</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.languages.map((lang: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded text-xs font-semibold capitalize"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    {isCurrentPlan ? (
                      <Button
                        disabled
                        className="w-full bg-yellow-400 text-black font-bold py-3 rounded"
                      >
                        ✓ Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpgrade(plan.slug)}
                        disabled={upgradeMutation.isPending}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded transition"
                      >
                        {upgradeMutation.isPending ? "Upgrading..." : "Choose Plan"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center">FAQ</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-yellow-400">
                  Can I change plans anytime?
                </h4>
                <p className="text-gray-400">
                  Yes! Upgrade or downgrade your plan anytime. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-yellow-400">
                  What happens after my trial ends?
                </h4>
                <p className="text-gray-400">
                  Your trial lasts 14 days. After that, you'll need to choose a plan to continue generating posts.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-yellow-400">
                  Do you offer refunds?
                </h4>
                <p className="text-gray-400">
                  We offer a 7-day money-back guarantee if you're not satisfied.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-yellow-400">
                  What's included in white-label?
                </h4>
                <p className="text-gray-400">
                  White-label includes custom branding, your logo, custom domain, and the ability to resell to your clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-yellow-400 bg-black py-6 mt-12">
        <div className="container text-center text-gray-500 text-xs">
          <p>PostSmarter © 2026 • Zimbabwe's First AI Creative Studio</p>
        </div>
      </footer>
    </div>
  );
}
