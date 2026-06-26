import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useSummarizeText, useSaveSummary } from "@workspace/api-client-react";
import { FileText, Loader2, Save, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  examQuestions: string[];
  vocabulary: { word: string; definition: string }[];
}

export default function SummarizerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const summarize = useSummarizeText();
  const save = useSaveSummary();

  const [text, setText] = useState("");
  const [length, setLength] = useState("standard");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim() || !user) return;
    try {
      const res = await summarize.mutateAsync({
        data: { text, length: length as "brief" | "standard" | "detailed", userId: user.id }
      });
      setResult({
        summary: res.summary,
        keyPoints: res.keyPoints as string[],
        examQuestions: res.examQuestions as string[],
        vocabulary: res.vocabulary as { word: string; definition: string }[],
      });
      setSaved(false);
    } catch {
      toast({ title: "Error", description: "Failed to summarize. Try again.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Summary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!user || !result) return;
    try {
      await save.mutateAsync({ data: { sourceType: "text", originalText: text.slice(0, 500), summary: result.summary, keyPoints: result.keyPoints, examQuestions: result.examQuestions, userId: user.id } });
      setSaved(true);
      toast({ title: "Saved!", description: "Summary saved to history." });
    } catch { /* silent */ }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">PDF / Text Summarizer</h1>
          <p className="text-sm text-muted-foreground">Paste text, get instant AI summaries with key points & exam questions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="text-input">Paste Your Text</Label>
              <Textarea
                id="text-input"
                placeholder="Paste your notes, article, or any text here to summarize..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                data-testid="input-text"
                className="mt-1 min-h-64 font-mono text-sm"
                rows={12}
              />
              <p className="text-xs text-muted-foreground mt-1">{text.length} characters</p>
            </div>
            <div>
              <Label>Summary Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger className="mt-1 w-48" data-testid="select-length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief (2-3 sentences)</SelectItem>
                  <SelectItem value="standard">Standard (3-4 paragraphs)</SelectItem>
                  <SelectItem value="detailed">Detailed (5-7 paragraphs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSummarize} disabled={!text.trim() || summarize.isPending} className="w-full" data-testid="btn-summarize">
              {summarize.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Summarizing...</> : <><FileText className="w-4 h-4 mr-2" /> Summarize</>}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <>
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Summary</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleCopy} data-testid="btn-copy">
                        {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSave} disabled={saved} data-testid="btn-save">
                        <Save className="w-4 h-4 mr-1" /> {saved ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base">Key Points</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Badge className="mt-0.5 flex-shrink-0 w-5 h-5 p-0 flex items-center justify-center text-xs">{i + 1}</Badge>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base">Possible Exam Questions</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.examQuestions.map((q, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-primary font-bold flex-shrink-0">Q{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {result.vocabulary?.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base">Vocabulary</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.vocabulary.map((v, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-semibold text-primary">{v.word}</span>
                          <span className="text-muted-foreground"> — {v.definition}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
              Paste text and click Summarize to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
