import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Target, Zap, Users, TrendingUp, Phone, MessageSquare, Clock } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Home() {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const targets = [
    { id: "delta", name: "Delta Corporation", mrr: "$10K - $25K", type: "Corporate" },
    { id: "econet", name: "Econet Wireless", mrr: "$12K - $30K", type: "Corporate" },
    { id: "innscor", name: "Innscor Africa", mrr: "$8K - $20K", type: "Corporate" },
    { id: "barkers", name: "Barkers Ogilvy", mrr: "$15K - $40K", type: "Agency" },
    { id: "tbwa", name: "TBWA Zimbabwe", mrr: "$15K - $40K", type: "Agency" },
    { id: "dataage", name: "DataAge Solutions", mrr: "$40K - $60K", type: "CRM" },
    { id: "dicomm", name: "Dicomm McCann", mrr: "$18K - $45K", type: "Agency" },
    { id: "shift", name: "Shift Engage", mrr: "$10K - $25K", type: "Agency" },
  ];

  const scripts = {
    gatekeeper: `Receptionist: "Good morning, [Company Name]."
You: "Hi, good morning. Could you please put me through to the Head of Digital Strategy or the Managing Director's office? This is Darrel, Founder of PostSmarter. I'm calling regarding a strategic localized AI partnership for your enterprise clients."`,
    
    whatsapp: `Hi [Name], this is Darrel, Founder of PostSmarter. 

I'm reaching out because we've developed a specialized AI engine that automates hyper-localized content in perfect Shona and Ndebele—something generic AI fails at. 

For [Company Name], this means you can slash localization costs by 80% and scale your service offerings with a white-label enterprise solution.`,
    
    demo: `1. Opening (1 min): "Thanks for taking the time, [Name]. I know you're busy, so I'll be direct. We've built PostSmarter to solve the biggest pain point for agencies and corporates in Zimbabwe: scaling authentic local language content."

2. The Problem (2 min): "You know how difficult and expensive it is to create high-quality Shona and Ndebele content that truly resonates."

3. The Solution (3 min): "PostSmarter is different. It's an AI engine trained specifically on Zimbabwean dialects and cultural nuances."

4. The Demo (5 min): "Let me show you. [Share screen]. Give me a brand, give me a topic. Watch this."

5. The ROI (3 min): "For a firm of your scale, this isn't just about saving $29. This is about saving $10,000 to $50,000 a month in labor."

6. The Close (1 min): "My goal is to make [Company Name] the undisputed leader in localized digital content."`
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
              <p className="text-xs text-slate-400">War Room Command Center</p>
            </div>
          </div>
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            <Zap className="w-3 h-3 mr-1" /> $250K MRR Mission
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-12 md:py-20">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            $250,000 MRR in 60-90 Days
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Your high-intensity execution manual for closing enterprise deals with Zimbabwe's biggest brands and agencies.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              Start Mission <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              View Manual
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Total Big Fish</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">19</div>
            <p className="text-xs text-slate-400 mt-1">High-value targets identified</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Total Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$293K</div>
            <p className="text-xs text-slate-400 mt-1">Combined MRR potential</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Required Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">48%</div>
            <p className="text-xs text-slate-400 mt-1">To hit $250K target</p>
          </CardContent>
        </Card>
      </section>

      {/* Main Content Tabs */}
      <section className="container pb-20">
        <Tabs defaultValue="targets" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="targets" className="data-[state=active]:bg-slate-700">
              <Target className="w-4 h-4 mr-2" /> Targets
            </TabsTrigger>
            <TabsTrigger value="scripts" className="data-[state=active]:bg-slate-700">
              <MessageSquare className="w-4 h-4 mr-2" /> Scripts
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-slate-700">
              <Clock className="w-4 h-4 mr-2" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="roi" className="data-[state=active]:bg-slate-700">
              <TrendingUp className="w-4 h-4 mr-2" /> ROI
            </TabsTrigger>
          </TabsList>

          {/* Targets Tab */}
          <TabsContent value="targets" className="space-y-6 mt-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Big Fish Hit List</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {targets.map((target) => (
                  <Card
                    key={target.id}
                    className={`bg-slate-800/50 border-slate-700/50 cursor-pointer transition-all hover:border-cyan-500/50 ${
                      selectedTarget === target.id ? "border-cyan-500 bg-slate-800" : ""
                    }`}
                    onClick={() => setSelectedTarget(target.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{target.name}</CardTitle>
                          <Badge variant="outline" className="mt-2 text-xs border-slate-600">
                            {target.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-cyan-400">{target.mrr}</p>
                          <p className="text-xs text-slate-400">MRR Potential</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Scripts Tab */}
          <TabsContent value="scripts" className="space-y-6 mt-6">
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-cyan-400" />
                    Gatekeeper Breaker Script
                  </CardTitle>
                  <CardDescription>For landlines (Barkers Ogilvy, TBWA, etc.)</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-900/50 p-4 rounded text-sm text-slate-300 overflow-x-auto">
                    {scripts.gatekeeper}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    Direct Hit WhatsApp Script
                  </CardTitle>
                  <CardDescription>For mobile numbers (DataAge, Dicomm, etc.)</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-900/50 p-4 rounded text-sm text-slate-300 overflow-x-auto">
                    {scripts.whatsapp}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    Executive Demo Script
                  </CardTitle>
                  <CardDescription>15-minute call structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-900/50 p-4 rounded text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {scripts.demo}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6 mt-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle>Daily Battle Rhythm</CardTitle>
                <CardDescription>Non-negotiable execution schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "07:00 – 08:30", task: "Target Reconnaissance", goal: "5 new qualified contacts" },
                    { time: "08:30 – 11:00", task: "Power Hour Outreach", goal: "20 new outreaches" },
                    { time: "11:00 – 13:00", task: "Active Follow-Up", goal: "10 custom samples sent" },
                    { time: "14:00 – 16:30", task: "Live Demos & Calls", goal: "2-3 follow-up meetings" },
                    { time: "16:30 – 18:00", task: "Pipeline Nurturing", goal: "5 objections handled" },
                    { time: "18:00 – 19:00", task: "Strategic Review", goal: "Next day targets ready" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-slate-700/50 last:border-0">
                      <div className="min-w-fit">
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                          {item.time}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.task}</p>
                        <p className="text-sm text-slate-400">{item.goal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROI Tab */}
          <TabsContent value="roi" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { scenario: "38% Conversion", clients: "7 Clients", mrr: "$111,340" },
                { scenario: "56% Conversion", clients: "11 Clients", mrr: "$164,080" },
                { scenario: "100% Conversion", clients: "19 Clients", mrr: "$293,000" },
              ].map((item, idx) => (
                <Card key={idx} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-base">{item.scenario}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-cyan-400">{item.mrr}</p>
                      <p className="text-sm text-slate-400">{item.clients}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle>The Math</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  To hit <span className="font-bold text-cyan-400">$250,000 MRR</span>, you need to convert just <span className="font-bold">60% of the Big Fish</span> (approximately 11-12 clients).
                </p>
                <p className="text-slate-300">
                  Even if you only hit <span className="font-bold">38% conversion</span>, you're still making <span className="font-bold text-cyan-400">$111,340/month</span>.
                </p>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-700/50">
                  <p className="text-sm text-slate-400">
                    <strong>Key Insight:</strong> You don't need perfection. You just need to be right about half the time. Focus on the biggest fish first (DataAge, Barkers, TBWA, Econet) to build momentum.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent py-12">
        <div className="container text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Execute?</h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            This is your command center. Every script, every target, every timeline is here. The only thing left is action.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
            Download Full Manual
          </Button>
        </div>
      </section>
    </div>
  );
}
