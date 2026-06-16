import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Trash2, Save, ArrowRight, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Queries
  const subscriptionQuery = trpc.billing.getSubscription.useQuery();
  const usageQuery = trpc.billing.getUsage.useQuery();
  const savedPostsQuery = trpc.billing.getSavedPosts.useQuery();
  const paymentHistoryQuery = trpc.billing.getPaymentHistory.useQuery();

  // Mutations
  const deleteSavedPostMutation = trpc.billing.deleteSavedPost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      savedPostsQuery.refetch();
    },
  });

  const subscription = subscriptionQuery.data;
  const usage = usageQuery.data;
  const savedPosts = savedPostsQuery.data || [];
  const payments = paymentHistoryQuery.data || [];

  const usagePercentage = usage
    ? Math.round((usage.used / usage.limit) * 100)
    : 0;

  const handleDeletePost = (postId: number) => {
    if (confirm("Delete this post?")) {
      deleteSavedPostMutation.mutate({ postId });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-yellow-400">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">PS✦</div>
            <div>
              <h1 className="font-bold text-lg">PostSmarter</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setLocation("/pricing")}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
            >
              Upgrade Plan
            </Button>
            <Button
              onClick={() => setLocation("/")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            >
              Generate Posts
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Subscription */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Plan */}
            <Card className="bg-gray-900 border-yellow-400 p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase">
                Current Plan
              </h3>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  {subscription?.plan?.name || "Free Trial"}
                </h2>
                <p className="text-gray-400 text-sm">
                  ${(subscription?.plan?.price / 100).toFixed(2)}/month
                </p>
              </div>
              <div className="space-y-2 mb-6 pb-6 border-b border-gray-700">
                <p className="text-xs text-gray-400">Status</p>
                <p className="font-semibold capitalize">
                  {subscription?.status === "trial" ? (
                    <span className="text-blue-400">14-Day Trial</span>
                  ) : (
                    <span className="text-green-400">Active</span>
                  )}
                </p>
              </div>
              <Button
                onClick={() => setLocation("/pricing")}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
              >
                Change Plan
              </Button>
            </Card>

            {/* Usage */}
            <Card className="bg-gray-900 border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase">
                Monthly Usage
              </h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">
                    {usage?.used || 0} / {usage?.limit || 0} posts
                  </span>
                  <span className="text-yellow-400 font-bold">
                    {usagePercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {usage?.remaining || 0} posts remaining this month
              </p>
            </Card>

            {/* Languages */}
            {subscription?.plan?.languages && (
              <Card className="bg-gray-900 border-gray-700 p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase">
                  Available Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subscription.plan.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded text-xs font-semibold capitalize"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Saved Posts & History */}
          <div className="lg:col-span-2 space-y-8">
            {/* Saved Posts */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Saved Posts</h3>
              {savedPosts.length === 0 ? (
                <Card className="bg-gray-900 border-gray-700 p-12 text-center">
                  <p className="text-gray-400 mb-4">No saved posts yet</p>
                  <Button
                    onClick={() => setLocation("/")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                  >
                    Generate Your First Post
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {savedPosts.map((post: any) => (
                    <Card
                      key={post.id}
                      className="bg-gray-900 border-gray-700 p-6 hover:border-yellow-400 transition"
                    >
                      {post.imageData && (
                        <img
                          src={post.imageData}
                          alt={post.businessName}
                          className="w-full h-40 object-cover rounded mb-4"
                        />
                      )}
                      <h4 className="font-bold mb-2">{post.businessName}</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        {post.headline}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedPost(post)}
                          size="sm"
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          onClick={() => handleDeletePost(post.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Payment History</h3>
              {payments.length === 0 ? (
                <Card className="bg-gray-900 border-gray-700 p-6 text-center text-gray-400">
                  No payments yet. You're on a free trial!
                </Card>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment: any) => (
                    <Card
                      key={payment.id}
                      className="bg-gray-900 border-gray-700 p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{payment.description}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-400">
                          ${(payment.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {payment.status}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-yellow-400 bg-black py-6 mt-12">
        <div className="container text-center text-gray-500 text-xs">
          <p>PostSmarter © 2026 • Zimbabwe's First AI Creative Studio</p>
        </div>
      </footer>
    </div>
  );
}
