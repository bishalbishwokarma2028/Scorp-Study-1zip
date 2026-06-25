import { useState } from "react";
import { useUser } from "@clerk/react";
import { useGenerateMindmap, useSaveMindmap, type MindmapResponse } from "@workspace/api-client-react";
import { Network, Loader2, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MindmapNode {
  label: string;
  children: string[];
}

interface MindmapData {
  center: string;
  branches: MindmapNode[];
}

const BRANCH_COLORS = [
  "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444",
  "#06B6D4", "#EC4899", "#84CC16", "#F97316", "#6366F1"
];

export default function MindmapPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const generateMindmap = useGenerateMindmap();
  const saveMindmap = useSaveMindmap();

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [mapData, setMapData] = useState<MindmapData | null>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    try {
      const result = await generateMindmap.mutateAsync({
        data: { topic, notes, userId: user.id }
      });
      setMapData({
        center: result.center,
        branches: result.branches as MindmapNode[],
      });
      setSaved(false);
    } catch {
      toast({ title: "Error", description: "Failed to generate mind map.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user || !mapData) return;
    try {
      await saveMindmap.mutateAsync({ data: { topic: topic || mapData.center, mapData: mapData as MindmapResponse, userId: user.id } });
      setSaved(true);
      toast({ title: "Saved!", description: "Mind map saved to history." });
    } catch { /* silent */ }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
          <Network className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Mind Map Generator</h1>
          <p className="text-sm text-muted-foreground">Visualize topics as interactive mind maps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="mm-topic">Topic</Label>
              <Input id="mm-topic" placeholder="e.g. Photosynthesis, Machine Learning..." value={topic} onChange={(e) => setTopic(e.target.value)} data-testid="input-topic" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="mm-notes">Context (optional)</Label>
              <Textarea id="mm-notes" placeholder="Paste notes or context..." value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-notes" className="mt-1" rows={4} />
            </div>
            <Button onClick={handleGenerate} disabled={(!topic && !notes) || generateMindmap.isPending} className="w-full" data-testid="btn-generate">
              {generateMindmap.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Network className="w-4 h-4 mr-2" /> Generate Mind Map</>}
            </Button>
            {mapData && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={handleGenerate} data-testid="btn-regenerate">
                  <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={handleSave} disabled={saved} data-testid="btn-save">
                  <Save className="w-4 h-4 mr-1" /> {saved ? "Saved" : "Save"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {mapData ? (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg px-6 py-3 rounded-2xl shadow-md">
                    {mapData.center}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mapData.branches.map((branch, i) => (
                    <div key={i} className="border rounded-xl p-4" style={{ borderColor: BRANCH_COLORS[i % BRANCH_COLORS.length] + "40", background: BRANCH_COLORS[i % BRANCH_COLORS.length] + "08" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: BRANCH_COLORS[i % BRANCH_COLORS.length] }} />
                        <span className="font-semibold text-sm" style={{ color: BRANCH_COLORS[i % BRANCH_COLORS.length] }}>{branch.label}</span>
                      </div>
                      <div className="space-y-1.5">
                        {branch.children.map((child, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground">{child}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
              <Network className="w-10 h-10 mb-3 opacity-30" />
              <p>Your mind map will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
