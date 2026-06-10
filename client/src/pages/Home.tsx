import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Download, Share2, Copy, Zap, Target, TrendingUp, Settings } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [contentType, setContentType] = useState("promo");
  const [language, setLanguage] = useState("shona");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const brands = [
    { id: "chicken-inn", name: "Chicken Inn", category: "Food & Beverage", color: "from-red-500 to-yellow-500" },
    { id: "econet", name: "Econet Wireless", category: "Telecom", color: "from-blue-500 to-cyan-500" },
    { id: "old-mutual", name: "Old Mutual", category: "Finance", color: "from-purple-500 to-pink-500" },
    { id: "delta", name: "Delta Corporation", category: "Beverages", color: "from-orange-500 to-red-500" },
    { id: "steward-bank", name: "Steward Bank", category: "Finance", color: "from-green-500 to-emerald-500" },
    { id: "innscor", name: "Innscor Africa", category: "Food & Beverage", color: "from-amber-500 to-orange-500" },
  ];

  const samplePosts = [
    {
      brand: "Chicken Inn",
      title: "CLUCKIN' GOOD DEAL",
      subtitle: "Weekend Vibes Only",
      language: "Shona",
      preview: "Nzara yarova? Nakirwa ne-combo yedu itsva inopisa! Bata yako izvozvi usati wasara.",
    },
    {
      brand: "Econet Wireless",
      title: "CONNECT ANYWHERE",
      subtitle: "Stay in Touch",
      language: "Ndebele",
      preview: "Siyabingelela mngane! Usulo-data wokuxhumana labantu bakho na? Ungasali emuva.",
    },
    {
      brand: "Old Mutual",
      title: "SECURE YOUR FUTURE",
      subtitle: "Peace of Mind Guaranteed",
      language: "Shona",
      preview: "Zvako zvine hutano here? Isu tine njira dzakakwana dzokurinda zvako zvose.",
    },
  ];

  const generateContent = async () => {
    if (!selectedBrand || !topic) {
      toast.error("Please select a brand and enter a topic");
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const samples = {
        shona: {
          promo: `Hesi shamwari! ${selectedBrand} ine zvinhu zvakasiyana-siyana zvakakwanira iwe. Bata zvako zvino usati wasara. #${selectedBrand.replace(/\s/g, "")}`,
          engagement: `Unoda kuziva zvakawanda nezvechikamu cheshona? Isu tine nhau dzose dzaunoda. Bvunza isu zvino!`,
          educational: `Nzira dzakakwanira dzokushandisa ${selectedBrand}: 1. Bvunza 2. Pindura 3. Shandisa. Zviri nyore!`,
        },
        ndebele: {
          promo: `Siyabingelela mngane! ${selectedBrand} inezinto ezahlukene ezakho. Zithathe khathesi ungakasali. #${selectedBrand.replace(/\s/g, "")}`,
          engagement: `Ufuna ukwazi okwengeziwe ngokwethu? Sinezinhlelo zonke ozifunayo. Buza isikhathi!`,
          educational: `Indlela yokusebenzisa ${selectedBrand}: 1. Buza 2. Phendula 3. Sebenzisa. Kulula!`,
        },
      };

      const generated = samples[language as keyof typeof samples]?.[contentType as keyof typeof samples.shona] || 
        "Content generated successfully!";
      
      setGeneratedContent(generated);
      setIsGenerating(false);
      toast.success("Content generated!");
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard!");
  };

  const downloadContent = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `postsmarter-${selectedBrand}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Content downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
              PS
            </div>
            <div>
              <h1 className="font-bold text-lg">PostSmarter</h1>
              <p className="text-xs text-slate-400">Localized Content Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <Sparkles className="w-3 h-3 mr-1" /> AI Powered
            </Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-slate-600">
                  <Settings className="w-4 h-4 mr-2" /> War Room
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle>War Room Status</DialogTitle>
                  <DialogDescription>Your $250K MRR mission dashboard</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-cyan-400">19</p>
                        <p className="text-xs text-slate-400">Big Fish Targets</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-cyan-400">$293K</p>
                        <p className="text-xs text-slate-400">Total Potential</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-cyan-400">48%</p>
                        <p className="text-xs text-slate-400">Conversion Rate</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50 mb-8">
            <TabsTrigger value="generate" className="data-[state=active]:bg-slate-700">
              <Sparkles className="w-4 h-4 mr-2" /> Generate
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-slate-700">
              <Target className="w-4 h-4 mr-2" /> Gallery
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
              <TrendingUp className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Content Generator */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle>Content Generator</CardTitle>
                    <CardDescription>Create hyper-localized posts in Shona & Ndebele</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Brand Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Brand</label>
                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="bg-slate-900/50 border-slate-700">
                          <SelectValue placeholder="Choose a brand..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name} • {brand.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="bg-slate-900/50 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="shona">Shona</SelectItem>
                            <SelectItem value="ndebele">Ndebele</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Content Type</label>
                        <Select value={contentType} onValueChange={setContentType}>
                          <SelectTrigger className="bg-slate-900/50 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="promo">Promotional</SelectItem>
                            <SelectItem value="engagement">Engagement</SelectItem>
                            <SelectItem value="educational">Educational</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Topic Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Topic / Hashtags</label>
                      <Input
                        placeholder="e.g., Weekend Deal, New Product Launch, Customer Testimonial"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-slate-900/50 border-slate-700"
                      />
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateContent}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Generated Content Preview */}
                {generatedContent && (
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Generated Content</span>
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                          {language.toUpperCase()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 min-h-24">
                        <p className="text-slate-200 leading-relaxed">{generatedContent}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copyToClipboard}
                          className="flex-1 border-slate-600"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={downloadContent}
                          className="flex-1 border-slate-600"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-slate-600"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Brand Cards */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm">Featured Brands</h3>
                {brands.slice(0, 3).map((brand) => (
                  <Card
                    key={brand.id}
                    className={`bg-gradient-to-br ${brand.color} cursor-pointer transition-all hover:shadow-lg ${
                      selectedBrand === brand.name ? "ring-2 ring-cyan-400" : ""
                    }`}
                    onClick={() => setSelectedBrand(brand.name)}
                  >
                    <CardContent className="pt-6">
                      <p className="font-bold text-white">{brand.name}</p>
                      <p className="text-xs text-white/80">{brand.category}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {samplePosts.map((post, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-slate-700/50 overflow-hidden hover:border-cyan-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{post.brand}</CardTitle>
                        <CardDescription className="text-xs">{post.language}</CardDescription>
                      </div>
                      <Badge variant="outline" className="border-slate-600">{post.language}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-bold text-lg text-cyan-400">{post.title}</h4>
                      <p className="text-sm text-slate-300 mt-1">{post.subtitle}</p>
                      <p className="text-xs text-slate-400 mt-3 italic">"{post.preview}"</p>
                    </div>
                    <Button size="sm" className="w-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30">
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Posts Generated", value: "247", trend: "+12%" },
                { label: "Avg Engagement", value: "8.4%", trend: "+2.3%" },
                { label: "Languages", value: "2", trend: "Shona, Ndebele" },
                { label: "Brands Active", value: "6", trend: "+1 this week" },
              ].map((stat, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="pt-6">
                    <p className="text-2xl font-bold text-cyan-400">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                    <p className="text-xs text-green-400 mt-2">{stat.trend}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: "Weekend Vibes - Chicken Inn", engagement: "12.4%", reach: "2.3K" },
                    { title: "Stay Connected - Econet", engagement: "9.8%", reach: "1.8K" },
                    { title: "Secure Future - Old Mutual", engagement: "7.2%", reach: "1.2K" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                      <p className="text-sm">{item.title}</p>
                      <div className="text-right">
                        <p className="text-xs text-cyan-400 font-semibold">{item.engagement}</p>
                        <p className="text-xs text-slate-400">{item.reach} reach</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-12 py-8">
        <div className="container text-center text-slate-400 text-sm">
          <p>PostSmarter © 2026 • Hyper-localized AI Content for Zimbabwe</p>
          <p className="mt-2 text-xs">Powering the $250K MRR mission with authentic local language content</p>
        </div>
      </footer>
    </div>
  );
}
