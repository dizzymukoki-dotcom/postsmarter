import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Share2, Sparkles, Loader, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const BUSINESS_TYPES = {
  "Restaurant / Fast Food": {
    colors: { primary: "#E63946", secondary: "#FFB703" },
  },
  "Bar / Nightlife": {
    colors: { primary: "#8B0000", secondary: "#FFD700" },
  },
  "Retail / Shopping": {
    colors: { primary: "#FF1493", secondary: "#FFB6C1" },
  },
  "Finance / Banking": {
    colors: { primary: "#0066CC", secondary: "#00D4FF" },
  },
  "Telecom / Tech": {
    colors: { primary: "#1E40AF", secondary: "#06B6D4" },
  },
  "Healthcare / Wellness": {
    colors: { primary: "#059669", secondary: "#10B981" },
  },
  "Real Estate": {
    colors: { primary: "#7C3AED", secondary: "#A78BFA" },
  },
  "Education / Training": {
    colors: { primary: "#D97706", secondary: "#FBBF24" },
  },
  "Travel / Tourism": {
    colors: { primary: "#0891B2", secondary: "#06B6D4" },
  },
  "Entertainment / Events": {
    colors: { primary: "#EC4899", secondary: "#F472B6" },
  },
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [businessName, setBusinessName] = useState("Your Business");
  const [businessType, setBusinessType] = useState("Restaurant / Fast Food");
  const [platform, setPlatform] = useState("instagram");
  const [language, setLanguage] = useState("english");
  const [headline, setHeadline] = useState("AMAZING OFFER");
  const [subheadline, setSubheadline] = useState("Limited Time Only");
  const [cta, setCta] = useState("SHOP NOW");
  const [hashtags, setHashtags] = useState("#ZimBusiness #SupportLocal #BuySmart");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [aiImageUrl, setAiImageUrl] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<Record<string, string> | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>("");

  const generatePostMutation = trpc.content.generatePost.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      if (data.imageUrl) {
        setAiImageUrl(data.imageUrl);
        renderPostWithAIImage(data.content, data.imageUrl);
      } else {
        renderPost(data.content);
      }
      toast.success("Post generated! ✨");
    },
    onError: (error) => {
      console.error("Generation error:", error);
      toast.error("Failed to generate post. Try again.");
    },
  });

  const generatePost = async () => {
    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    generatePostMutation.mutate({
      businessName,
      businessType,
      platform: platform as "instagram" | "facebook" | "tiktok" | "whatsapp",
      language: language as "english" | "shona" | "ndebele",
      headline,
      subheadline,
      cta,
      hashtags,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setUploadedImage(imageData);
      toast.success("Image uploaded! Generate to apply it.");
    };
    reader.readAsDataURL(file);
  };

  const renderPostWithAIImage = (content: Record<string, string>, imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350;

    // Load and draw AI-generated image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawOverlay(ctx, canvas, content);
    };
    img.onerror = () => {
      console.warn("Failed to load AI image, using fallback");
      drawGradientBackground(ctx, canvas);
      drawOverlay(ctx, canvas, content);
    };
    img.src = imageUrl;
  };

  const renderPost = (content: Record<string, string>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const template = BUSINESS_TYPES[businessType as keyof typeof BUSINESS_TYPES];

    canvas.width = 1080;
    canvas.height = 1350;

    if (uploadedImage) {
      // Draw uploaded image as background
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawOverlay(ctx, canvas, content);
      };
      img.onerror = () => {
        toast.error("Failed to load image");
        drawGradientBackground(ctx, canvas);
        drawOverlay(ctx, canvas, content);
      };
      img.src = uploadedImage;
    } else {
      drawGradientBackground(ctx, canvas);
      drawOverlay(ctx, canvas, content);
    }
  };

  const drawGradientBackground = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const template = BUSINESS_TYPES[businessType as keyof typeof BUSINESS_TYPES];
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, template.colors.primary);
    gradient.addColorStop(1, template.colors.secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    content: Record<string, string>
  ) => {
    // Add dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw business name badge
    const template = BUSINESS_TYPES[businessType as keyof typeof BUSINESS_TYPES];
    ctx.fillStyle = template.colors.primary;
    ctx.fillRect(0, 20, canvas.width, 80);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(businessName.toUpperCase(), canvas.width / 2, 60);

    // Draw headline
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 120px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const headlineY = canvas.height * 0.45;
    const words = (content.headline || headline).split(" ");
    let currentY = headlineY - (words.length - 1) * 60;

    words.forEach((word) => {
      ctx.fillText(word, canvas.width / 2, currentY);
      currentY += 120;
    });

    // Draw subheadline
    ctx.font = "40px Arial, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(content.subheadline || subheadline, canvas.width / 2, canvas.height * 0.65);

    // Draw CTA button
    const buttonY = canvas.height * 0.75;
    const buttonWidth = 400;
    const buttonHeight = 70;
    const buttonX = (canvas.width - buttonWidth) / 2;

    ctx.fillStyle = template.colors.primary;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 35);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const ctaText = typeof content.cta === "string" ? content.cta : cta;
    ctx.fillText(ctaText, canvas.width / 2, buttonY + buttonHeight / 2);

    // Draw hashtags
    ctx.font = "24px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.textAlign = "center";
    const hashtagText = typeof content.hashtags === "string" ? content.hashtags : hashtags;
    ctx.fillText(hashtagText, canvas.width / 2, canvas.height * 0.95);

    // Convert to image
    const url = canvas.toDataURL("image/png");
    setPreviewUrl(url);
  };

  const downloadPost = () => {
    if (!previewUrl) {
      toast.error("Generate a post first");
      return;
    }

    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `postsmarter-${businessName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded!");
  };

  const sharePost = () => {
    if (!previewUrl) {
      toast.error("Generate a post first");
      return;
    }
    toast.success("Share functionality coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              PS
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">PostSmarter</h1>
              <p className="text-xs text-slate-500">AI Social Media Generator</p>
            </div>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-orange-300">
            <Sparkles className="w-3 h-3 mr-1" /> AI Powered
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Your Post</h2>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name</label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Pizza Inn Bulawayo"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Type</label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    {Object.keys(BUSINESS_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    <SelectItem value="instagram">📸 Instagram</SelectItem>
                    <SelectItem value="facebook">👥 Facebook</SelectItem>
                    <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    <SelectItem value="english">🇬🇧 English</SelectItem>
                    <SelectItem value="shona">🇿🇼 Shona</SelectItem>
                    <SelectItem value="ndebele">🇿🇼 Ndebele</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Headline</label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., AMAZING OFFER"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Subheadline */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subheadline</label>
                <Input
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="e.g., Limited Time Only"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* CTA */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Call to Action</label>
                <Input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g., SHOP NOW"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hashtags</label>
                <Textarea
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="e.g., #ZimBusiness #SupportLocal"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 min-h-20"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Your Own Image (Optional)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-32 object-cover rounded" />
                      <Button
                        onClick={() => {
                          setUploadedImage("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="ghost"
                      className="w-full text-slate-600 hover:text-slate-900"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Click to upload image from phone
                    </Button>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generatePost}
                disabled={generatePostMutation.isPending}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-6 text-lg rounded-xl"
              >
                {generatePostMutation.isPending ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Post
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {previewUrl ? (
                <div className="space-y-4 p-6">
                  <img src={previewUrl} alt="Generated Post" className="w-full rounded-xl shadow-md" />
                  {generatedContent && (
                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                      <p className="text-xs font-semibold text-slate-600">AI-Generated Caption:</p>
                      <p className="text-sm text-slate-700">{generatedContent.caption || generatedContent.headline}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={downloadPost}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      onClick={sharePost}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold">Your post will appear here</p>
                    <p className="text-slate-400 text-sm mt-2">Fill in the details and click Generate</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-slate-900 mb-4">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✨ AI generates custom images for your business</li>
                <li>🎯 Supports Shona & Ndebele for local reach</li>
                <li>📱 Or upload your own images from phone</li>
                <li>🌍 Test different languages for your audience</li>
                <li>⏰ Post at peak engagement times</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-6">
        <div className="container text-center text-slate-500 text-sm">
          <p>PostSmarter © 2026 • AI-powered social media content for Zimbabwe & SADC • Perfect for agencies and businesses</p>
        </div>
      </footer>
    </div>
  );
}
