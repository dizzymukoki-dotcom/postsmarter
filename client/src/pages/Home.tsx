import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Download, Share2, Copy, Zap, BarChart3, Settings } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create");
  const [brandName, setBrandName] = useState("");
  const [language, setLanguage] = useState("shona");
  const [contentType, setContentType] = useState("promotional");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPosts, setSavedPosts] = useState<Array<{ id: string; brand: string; content: string; language: string; date: string }>>([]);

  const contentTypes = [
    { value: "promotional", label: "Promotional - Sales & Deals" },
    { value: "engagement", label: "Engagement - Community Building" },
    { value: "educational", label: "Educational - Tips & Tutorials" },
    { value: "testimonial", label: "Testimonial - Customer Stories" },
    { value: "announcement", label: "Announcement - New Products" },
  ];

  const generateContent = async () => {
    if (!brandName || !topic) {
      toast.error("Please enter brand name and topic");
      return;
    }

    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      const templates = {
        shona: {
          promotional: `Hesi shamwari! 🎉\n\n${brandName} ine ${topic} yakasiyana-siyana zvakakwanira iwe. Mitengo yakaderera, zvakakwanira zvose!\n\nBata zvako zvino usati wasara. #${brandName.replace(/\s/g, "")} #Zim #Shona`,
          engagement: `Unoda kuziva zvakawanda nezvechikamu cheshona? 🤔\n\n${brandName} inotora ${topic} zvakakwanira. Bvunza isu zvino!\n\nTinogona kuzviponesa zvose zvaunoda. #${brandName.replace(/\s/g, "")}`,
          educational: `Nzira dzakakwanira dzokushandisa ${brandName}:\n\n1️⃣ ${topic} - Zvinotanga\n2️⃣ Shandisa - Zviri nyore\n3️⃣ Pindura - Tiri pano\n\nZviri nyore! #Tips #${brandName.replace(/\s/g, "")}`,
          testimonial: `"${topic}" - Mufakazi wedu\n\n${brandName} inodikanwa zvakanyanya! Vanhu vose vanofarira.\n\nUnoda kuziva zvakawanda? Bvunza isu! #Happy #${brandName.replace(/\s/g, "")}`,
          announcement: `🚀 MANYUWO MANYUWO! 🚀\n\n${brandName} ine ${topic} itsva!\n\nIno revolutionary, ino amazing, ino perfect!\n\nBata yako zvino! #New #${brandName.replace(/\s/g, "")}`,
        },
        ndebele: {
          promotional: `Siyabingelela mngane! 🎉\n\n${brandName} inezinto ezahlukene ze${topic}. Intengo ephansi, konke okuhle!\n\nZithathe khathesi ungakasali. #${brandName.replace(/\s/g, "")} #Zim #Ndebele`,
          engagement: `Ufuna ukwazi okwengeziwe ngokwe${topic}? 🤔\n\n${brandName} inezinhlelo ezihle. Buza isikhathi!\n\nSinezinhlelo zonke ozifunayo. #${brandName.replace(/\s/g, "")}`,
          educational: `Indlela yokusebenzisa ${brandName}:\n\n1️⃣ ${topic} - Qala\n2️⃣ Sebenzisa - Kulula\n3️⃣ Phendula - Nasi\n\nKulula! #Tips #${brandName.replace(/\s/g, "")}`,
          testimonial: `"${topic}" - Umuntu wethu\n\n${brandName} iyakonakala kakhulu! Wonke umuntu uyayithanda.\n\nUfuna ukwazi okwengeziwe? Buza! #Happy #${brandName.replace(/\s/g, "")}`,
          announcement: `🚀 INDABA ENKULU! 🚀\n\n${brandName} inezinto ezintsha ze${topic}!\n\nIyahlukile, iyamangalisa, iyaperfect!\n\nZithathe khathesi! #New #${brandName.replace(/\s/g, "")}`,
        },
      };

      const generated = templates[language as keyof typeof templates]?.[contentType as keyof typeof templates.shona] || 
        "Content generated successfully!";
      
      setGeneratedContent(generated);
      setIsGenerating(false);
      toast.success("Content generated! ✨");
    }, 1200);
  };

  const savePost = () => {
    if (!generatedContent) {
      toast.error("Generate content first");
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      brand: brandName,
      content: generatedContent,
      language: language.toUpperCase(),
      date: new Date().toLocaleDateString(),
    };

    setSavedPosts([newPost, ...savedPosts]);
    toast.success("Post saved!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadPost = () => {
    if (!generatedContent) {
      toast.error("Generate content first");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([generatedContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `postsmarter-${brandName}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded!");
  };

  const deletePost = (id: string) => {
    setSavedPosts(savedPosts.filter(p => p.id !== id));
    toast.success("Post deleted");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
              PS
            </div>
            <div>
              <h1 className="font-bold text-lg">PostSmarter</h1>
              <p className="text-xs text-slate-400">Localized Content Generator</p>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            <Sparkles className="w-3 h-3 mr-1" /> AI Powered
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700/50 mb-8">
            <TabsTrigger value="create" className="data-[state=active]:bg-slate-700">
              <Sparkles className="w-4 h-4 mr-2" /> Create
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-slate-700">
              <BarChart3 className="w-4 h-4 mr-2" /> Saved ({savedPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Generator Panel */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle>Content Generator</CardTitle>
                    <CardDescription>Create hyper-localized posts in Shona & Ndebele</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Brand Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Brand Name</label>
                      <Input
                        placeholder="e.g., Chicken Inn, Econet, Old Mutual"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {/* Language & Content Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="bg-slate-900/50 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="shona">🇿🇼 Shona</SelectItem>
                            <SelectItem value="ndebele">🇿🇼 Ndebele</SelectItem>
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
                            {contentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Topic / Hashtags</label>
                      <Textarea
                        placeholder="e.g., Weekend Deal, New Product Launch, Customer Testimonial, Limited Time Offer"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 min-h-20"
                      />
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateContent}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
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
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-cyan-400">{savedPosts.length}</p>
                      <p className="text-xs text-slate-400">Posts Saved</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-400">2</p>
                      <p className="text-xs text-slate-400">Languages</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-400">5</p>
                      <p className="text-xs text-slate-400">Content Types</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-300 space-y-2">
                    <p>✨ Be specific with topics for better results</p>
                    <p>🎯 Use both languages to reach wider audiences</p>
                    <p>💾 Save posts for future use</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Generated Content Preview */}
            {generatedContent && (
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Content</CardTitle>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                      {language.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50 min-h-32">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{generatedContent}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedContent)}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadPost}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={savePost}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Posts Tab */}
          <TabsContent value="saved" className="space-y-4">
            {savedPosts.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400">No saved posts yet</p>
                  <p className="text-xs text-slate-500 mt-2">Generate and save content to see it here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {savedPosts.map((post) => (
                  <Card key={post.id} className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{post.brand}</CardTitle>
                          <CardDescription className="text-xs">{post.date}</CardDescription>
                        </div>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {post.language}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-slate-900/50 p-4 rounded-lg text-sm text-slate-200 max-h-24 overflow-y-auto">
                        {post.content}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(post.content)}
                          className="flex-1 border-slate-600 hover:bg-slate-700"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-slate-600 hover:bg-slate-700"
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePost(post.id)}
                          className="flex-1 border-red-600/30 text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-12 py-8">
        <div className="container text-center text-slate-400 text-sm">
          <p>PostSmarter © 2026 • Hyper-localized AI Content for Zimbabwe</p>
          <p className="mt-2 text-xs">Generate authentic Shona & Ndebele content in seconds</p>
        </div>
      </footer>
    </div>
  );
}
