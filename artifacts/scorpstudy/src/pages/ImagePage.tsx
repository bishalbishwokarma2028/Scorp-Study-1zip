import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useEnhancePrompt, useSaveImage } from "@workspace/api-client-react";
import { Image, Sparkles, Download, Save, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const STYLES = [
  { value: "realistic", label: "Realistic" },
  { value: "diagram", label: "Educational Diagram" },
  { value: "cartoon", label: "Cartoon / Illustrated" },
  { value: "minimalist", label: "Minimalist" },
  { value: "3d", label: "3D Render" },
  { value: "watercolor", label: "Watercolor" },
];

const SIZES = [
  { value: "1024x1024", label: "Square (1024×1024)" },
  { value: "1280x720", label: "Wide (1280×720)" },
  { value: "720x1280", label: "Tall (720×1280)" },
];

export default function ImagePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const enhancePrompt = useEnhancePrompt();
  const saveImage = useSaveImage();

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [size, setSize] = useState("1024x1024");
  const [imageUrl, setImageUrl] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const buildPollinationsUrl = (p: string, w: number, h: number) => {
    const encoded = encodeURIComponent(`${p}, ${style} style`);
    return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&model=flux&nologo=true&seed=${Date.now()}`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;
    setGenerating(true);
    setSaved(false);
    const [w, h] = size.split("x").map(Number);
    try {
      const url = buildPollinationsUrl(prompt, w, h);
      setImageUrl(url);
      setEnhancedPrompt("");
    } catch {
      toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleEnhance = async () => {
    if (!user) return;
    try {
      const result = await enhancePrompt.mutateAsync({ data: { prompt, userId: user.id } });
      const enhanced = (result as { enhancedPrompt: string }).enhancedPrompt;
      setPrompt(enhanced);
      setEnhancedPrompt(enhanced);
    } catch {
      toast({ title: "Error", description: "Failed to enhance prompt.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user || !imageUrl) return;
    try {
      await saveImage.mutateAsync({ data: { prompt, enhancedPrompt: enhancedPrompt || null, imageUrl, style, userId: user.id } });
      setSaved(true);
      toast({ title: "Saved!", description: "Image saved to your gallery." });
    } catch { /* silent */ }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `scorpstudy-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
          <Image className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Image Generator</h1>
          <p className="text-sm text-muted-foreground">Create study diagrams and visual aids with AI (Pollinations)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="prompt">Image Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to create... e.g. 'A detailed diagram of a plant cell with labeled parts'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                data-testid="input-prompt"
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-1" data-testid="select-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className="mt-1" data-testid="select-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleEnhance}
              disabled={!prompt.trim() || enhancePrompt.isPending}
              className="w-full"
              data-testid="btn-enhance"
            >
              {enhancePrompt.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />}
              Enhance Prompt with AI
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="w-full"
              data-testid="btn-generate"
            >
              {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Image className="w-4 h-4 mr-2" /> Generate Image</>}
            </Button>
          </CardContent>
        </Card>

        <div>
          {imageUrl ? (
            <Card className="shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full object-cover"
                  data-testid="img-generated"
                  onError={() => toast({ title: "Image failed to load", description: "Pollinations may be slow. Try again.", variant: "destructive" })}
                />
              </div>
              <CardContent className="pt-4 flex gap-3">
                <Button variant="outline" onClick={() => handleGenerate()} className="flex-1" data-testid="btn-regenerate">
                  <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                </Button>
                <Button variant="outline" onClick={handleDownload} data-testid="btn-download">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={handleSave} disabled={saved || saveImage.isPending} data-testid="btn-save">
                  <Save className="w-4 h-4 mr-1" /> {saved ? "Saved" : "Save"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
              <Image className="w-10 h-10 mb-3 opacity-40" />
              <p>Your generated image will appear here</p>
              <p className="text-xs mt-1">Powered by Pollinations AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
