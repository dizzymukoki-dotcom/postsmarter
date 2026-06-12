import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
  const [businessName, setBusinessName] = useState("e.g. Chicken Inn Bulawayo");
  const [businessType, setBusinessType] = useState("Restaurant / Fast Food");
  const [platform, setPlatform] = useState("instagram");
  const [language, setLanguage] = useState("english");
  const [headline, setHeadline] = useState("AMAZING OFFER");
  const [subheadline, setSubheadline] = useState("Limited Time Only");
  const [cta, setCta] = useState("SHOP NOW");
  const [hashtags, setHashtags] = useState("#ZimBusiness #SupportLocal #BuySmart");
  const [brandColor, setBrandColor] = useState("#E63946");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [aiImageUrl, setAiImageUrl] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<Record<string, string> | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);

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
    if (!businessName.trim() || businessName === "e.g. Chicken Inn Bulawayo") {
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

    canvas.width = 1080;
    canvas.height = 1350;

    if (uploadedImage) {
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
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, brandColor);
    gradient.addColorStop(1, adjustBrightness(brandColor, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    content: Record<string, string>
  ) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = brandColor;
    ctx.fillRect(0, 20, canvas.width, 80);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(businessName.toUpperCase(), canvas.width / 2, 60);

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

    ctx.font = "40px Arial, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(content.subheadline || subheadline, canvas.width / 2, canvas.height * 0.65);

    const buttonY = canvas.height * 0.75;
    const buttonWidth = 400;
    const buttonHeight = 70;
    const buttonX = (canvas.width - buttonWidth) / 2;

    ctx.fillStyle = brandColor;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 35);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const ctaText = typeof content.cta === "string" ? content.cta : cta;
    ctx.fillText(ctaText, canvas.width / 2, buttonY + buttonHeight / 2);

    ctx.font = "24px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.textAlign = "center";
    const hashtagText = typeof content.hashtags === "string" ? content.hashtags : hashtags;
    ctx.fillText(hashtagText, canvas.width / 2, canvas.height * 0.95);

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

  const adjustBrightness = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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
              <p className="text-xs text-gray-400">AI Creative Studio</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="text-gray-300 hover:text-white text-sm">Pricing</button>
            <button className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-sm">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-black py-16 text-center border-b border-yellow-400">
        <div className="container">
          <p className="text-gray-500 text-sm tracking-widest mb-4">ZIMBABWE'S FIRST AI CREATIVE STUDIO</p>
          <h2 className="text-6xl font-bold mb-2">
            POST<br />
            <span className="text-yellow-400" style={{ textShadow: "2px 2px 0px rgba(255,255,255,0.1)" }}>SMARTER</span>
          </h2>
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
            AI generates professional marketing graphics with Shona and Ndebele copy — ready to post in 30 seconds.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-2 border-dashed border-yellow-400 p-6 rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-400 text-black w-8 h-8 rounded flex items-center justify-center font-bold text-sm">1</div>
                  <label className="text-sm font-semibold text-gray-300 uppercase">Business Name</label>
                </div>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Chicken Inn Bulawayo"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                />
              </div>

              {/* Step 2 */}
              <div className="border-2 border-dashed border-pink-500 p-6 rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-pink-500 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-sm">2</div>
                  <label className="text-sm font-semibold text-gray-300 uppercase">Business Type</label>
                </div>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {Object.keys(BUSINESS_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 3 */}
              <div className="border-2 border-dashed border-orange-500 p-6 rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-sm">3</div>
                  <label className="text-sm font-semibold text-gray-300 uppercase">Headline</label>
                </div>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. AMAZING OFFER"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                />
              </div>

              {/* Step 4 - Brand Color */}
              <div className="border-2 border-dashed border-red-500 p-6 rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-500 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-sm">4</div>
                  <label className="text-sm font-semibold text-gray-300 uppercase">Brand Color</label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-16 h-12 rounded cursor-pointer"
                  />
                  <span className="text-gray-400">Selected: {brandColor}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.values(BUSINESS_TYPES).map((type, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBrandColor(type.colors.primary)}
                      className="w-8 h-8 rounded border-2 border-gray-600 hover:border-white transition"
                      style={{ backgroundColor: type.colors.primary }}
                      title={Object.keys(BUSINESS_TYPES)[idx]}
                    />
                  ))}
                </div>
              </div>

              {/* Step 5 - Additional Options */}
              <div className="border-2 border-dashed border-green-500 p-6 rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-sm">5</div>
                  <label className="text-sm font-semibold text-gray-300 uppercase">Subheadline</label>
                </div>
                <Input
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="e.g. Limited Time Only"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                />
              </div>

              {/* CTA */}
              <div className="border-2 border-dashed border-purple-500 p-6 rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-sm">6</div>
                  <label className="text-sm font-semibold text-gray-300 uppercase">Call to Action</label>
                </div>
                <Input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g. SHOP NOW"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                />
              </div>

              {/* Hashtags */}
              <div className="border-2 border-dashed border-blue-500 p-6 rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-sm">7</div>
                  <label className="text-sm font-semibold text-gray-300 uppercase">Hashtags</label>
                </div>
                <Textarea
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="e.g. #ZimBusiness #SupportLocal"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 min-h-20"
                />
              </div>

              {/* Image Upload */}
              <div className="border-2 border-dashed border-indigo-500 p-6 rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-500 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-sm">8</div>
                  <label className="text-sm font-semibold text-gray-300 uppercase">Upload Image (Optional)</label>
                </div>
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
                      className="w-full text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white border border-gray-700"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Click to upload image from phone
                  </Button>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={generatePost}
                disabled={generatePostMutation.isPending}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 text-lg rounded"
              >
                {generatePostMutation.isPending ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Continue →
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-gray-900 rounded border-2 border-yellow-400 overflow-hidden">
                {previewUrl ? (
                  <div className="space-y-4 p-4">
                    <img src={previewUrl} alt="Generated Post" className="w-full rounded" />
                    {generatedContent && (
                      <div className="bg-gray-800 p-3 rounded text-sm space-y-2">
                        <p className="text-xs font-semibold text-gray-400">AI-Generated Caption:</p>
                        <p className="text-gray-300 text-xs">{generatedContent.caption || generatedContent.headline}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={downloadPost}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 text-sm rounded flex items-center justify-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        onClick={sharePost}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 text-sm rounded flex items-center justify-center gap-1"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 font-semibold text-sm">Your post preview</p>
                      <p className="text-gray-600 text-xs mt-1">will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Footer */}
      <footer className="border-t border-yellow-400 bg-black py-6 mt-12">
        <div className="container text-center text-gray-500 text-xs">
          <p>PostSmarter © 2026 • Zimbabwe's First AI Creative Studio</p>
        </div>
      </footer>
    </div>
  );
}
