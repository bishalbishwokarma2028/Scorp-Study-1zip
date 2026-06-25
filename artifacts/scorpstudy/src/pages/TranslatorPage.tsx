import { useState } from "react";
import { useUser } from "@clerk/react";
import { useTranslateText, useSaveTranslation } from "@workspace/api-client-react";
import { Languages, Loader2, Copy, Save, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  "Auto-detect", "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Japanese", "Korean", "Chinese", "Arabic", "Hindi", "Russian", "Dutch",
  "Swedish", "Norwegian", "Turkish", "Polish", "Vietnamese", "Thai", "Nepali"
];

export default function TranslatorPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const translateText = useTranslateText();
  const saveTranslation = useSaveTranslation();

  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("Auto-detect");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [result, setResult] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim() || !user) return;
    try {
      const res = await translateText.mutateAsync({
        data: {
          text,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang !== "Auto-detect" ? sourceLang : undefined,
          userId: user.id,
        }
      });
      setResult(res.translation);
      setDetectedLang(res.detectedLanguage || "");
      setSaved(false);
    } catch {
      toast({ title: "Error", description: "Translation failed. Try again.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!user || !result) return;
    try {
      await saveTranslation.mutateAsync({
        data: { originalText: text, translatedText: result, sourceLanguage: detectedLang || sourceLang, targetLanguage: targetLang, userId: user.id }
      });
      setSaved(true);
      toast({ title: "Saved!", description: "Translation saved to history." });
    } catch { /* silent */ }
  };

  const swap = () => {
    if (sourceLang === "Auto-detect") return;
    const tmp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tmp);
    setText(result);
    setResult("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Languages className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Translator</h1>
          <p className="text-sm text-muted-foreground">Translate study materials into any language</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger className="mt-1" data-testid="select-source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" onClick={swap} className="mt-5" data-testid="btn-swap" title="Swap languages">
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="mt-1" data-testid="select-target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.filter((l) => l !== "Auto-detect").map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            {detectedLang && <p className="text-xs text-muted-foreground mb-2">Detected: <span className="font-medium text-primary">{detectedLang}</span></p>}
            <Textarea
              placeholder="Enter text to translate..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-testid="input-text"
              className="min-h-48 resize-none border-none shadow-none focus-visible:ring-0 p-0 bg-transparent text-sm"
              rows={8}
            />
            <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
              <span className="text-xs text-muted-foreground">{text.length} chars</span>
              <Button onClick={handleTranslate} disabled={!text.trim() || translateText.isPending} data-testid="btn-translate">
                {translateText.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Translating...</> : <><Languages className="w-4 h-4 mr-2" /> Translate</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <div className="min-h-48 text-sm leading-relaxed text-foreground whitespace-pre-wrap" data-testid="text-result">
              {result || <span className="text-muted-foreground italic">Translation will appear here...</span>}
            </div>
            {result && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-3">
                <Button variant="ghost" size="sm" onClick={handleCopy} data-testid="btn-copy">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave} disabled={saved} data-testid="btn-save">
                  <Save className="w-4 h-4 mr-1" /> {saved ? "Saved" : "Save"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
