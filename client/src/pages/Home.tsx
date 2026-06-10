import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PostData {
  platform: string;
  language: string;
  headline: string;
  subheadline: string;
  cta: string;
  hashtags: string;
  backgroundImage: string;
}

const BRAND_TEMPLATES = {
  "Chicken Inn": {
    colors: { primary: "#E63946", secondary: "#FFB703" },
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=1200&h=600&fit=crop",
  },
  "Econet": {
    colors: { primary: "#0066CC", secondary: "#00D4FF" },
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
  },
  "Old Mutual": {
    colors: { primary: "#8B0000", secondary: "#FFD700" },
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
  },
  "Innscor": {
    colors: { primary: "#DC143C", secondary: "#FFA500" },
    image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=600&fit=crop",
  },
  "Steward Bank": {
    colors: { primary: "#1E40AF", secondary: "#06B6D4" },
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=600&fit=crop",
  },
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brand, setBrand] = useState("Chicken Inn");
  const [platform, setPlatform] = useState("instagram");
  const [language, setLanguage] = useState("english");
  const [headline, setHeadline] = useState("CLUCKIN' GOOD DEAL");
  const [subheadline, setSubheadline] = useState("Weekend Vibes Only");
  const [cta, setCta] = useState("GET YOURS");
  const [hashtags, setHashtags] = useState("#ZimFoodie #BulawayoEats #ChickenLovers #WeekendVibes");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const generatePost = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const template = BRAND_TEMPLATES[brand as keyof typeof BRAND_TEMPLATES];
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        canvas.width = 1080;
        canvas.height = 1350;

        // Draw background image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Add dark overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        const words = headline.split(" ");
        let currentY = headlineY - (words.length - 1) * 60;
        
        words.forEach((word) => {
          ctx.fillText(word, canvas.width / 2, currentY);
          currentY += 120;
        });

        // Draw subheadline
        ctx.font = "40px Arial, sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(subheadline, canvas.width / 2, canvas.height * 0.65);

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
        ctx.fillText(cta, canvas.width / 2, buttonY + buttonHeight / 2);

        // Draw hashtags
        ctx.font = "24px Arial, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.textAlign = "center";
        ctx.fillText(hashtags, canvas.width / 2, canvas.height * 0.95);

        // Convert to image
        const url = canvas.toDataURL("image/png");
        setPreviewUrl(url);
        setIsGenerating(false);
        toast.success("Post generated! ✨");
      };

      img.onerror = () => {
        setIsGenerating(false);
        toast.error("Failed to load image");
      };

      img.src = template.image;
    }, 800);
  };

  const downloadPost = () => {
    if (!previewUrl) {
      toast.error("Generate a post first");
      return;
    }

    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `postsmarter-${brand}-${Date.now()}.png`;
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
              <p className="text-xs text-slate-500">Social Media Generator</p>
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

              {/* Brand Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    {Object.keys(BRAND_TEMPLATES).map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
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
                  placeholder="e.g., CLUCKIN' GOOD DEAL"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Subheadline */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subheadline</label>
                <Input
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="e.g., Weekend Vibes Only"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* CTA */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Call to Action</label>
                <Input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g., GET YOURS"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hashtags</label>
                <Textarea
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="e.g., #ZimFoodie #BulawayoEats"
                  className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 min-h-20"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generatePost}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-6 text-lg rounded-xl"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
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
                  <img
                    src={previewUrl}
                    alt="Generated Post"
                    className="w-full rounded-xl shadow-md"
                  />
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
              <h3 className="font-bold text-slate-900 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✨ Keep headlines short and punchy</li>
                <li>🎯 Use relevant hashtags for reach</li>
                <li>📱 Test on different platforms</li>
                <li>🌍 Translate for local audiences</li>
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
          <p>PostSmarter © 2026 • Create engaging social media content in seconds</p>
        </div>
      </footer>
    </div>
  );
}
