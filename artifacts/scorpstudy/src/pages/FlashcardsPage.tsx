import { useState } from "react";
import { useUser } from "@clerk/react";
import { useGenerateFlashcards, useSaveFlashcardSet } from "@workspace/api-client-react";
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const generateFlashcards = useGenerateFlashcards();
  const saveSet = useSaveFlashcardSet();

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [numCards, setNumCards] = useState("10");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [cardTopic, setCardTopic] = useState("");
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    try {
      const result = await generateFlashcards.mutateAsync({
        data: { topic, notes, numCards: parseInt(numCards), userId: user.id }
      });
      const c = result.cards as Flashcard[];
      setCards(c);
      setCardTopic(result.topic || topic);
      setCurrent(0);
      setFlipped(false);
      setSaved(false);
    } catch {
      toast({ title: "Error", description: "Failed to generate flashcards.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user || cards.length === 0) return;
    try {
      await saveSet.mutateAsync({ data: { topic: cardTopic, cards, userId: user.id } });
      setSaved(true);
      toast({ title: "Saved!", description: "Flashcard set saved to your history." });
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    }
  };

  const handlePrev = () => { setCurrent((c) => Math.max(0, c - 1)); setFlipped(false); };
  const handleNext = () => { setCurrent((c) => Math.min(cards.length - 1, c + 1)); setFlipped(false); };

  if (cards.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Flashcard Maker</h1>
            <p className="text-sm text-muted-foreground">AI-generated flashcards for any topic</p>
          </div>
        </div>
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-5">
            <div>
              <Label htmlFor="fc-topic">Topic</Label>
              <Input id="fc-topic" placeholder="e.g. Spanish Verbs, Periodic Table, Human Anatomy..." value={topic} onChange={(e) => setTopic(e.target.value)} data-testid="input-topic" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fc-notes">Notes (optional)</Label>
              <Textarea id="fc-notes" placeholder="Paste your study material here..." value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-notes" className="mt-1" rows={4} />
            </div>
            <div>
              <Label>Number of Cards</Label>
              <Select value={numCards} onValueChange={setNumCards}>
                <SelectTrigger className="mt-1 w-40" data-testid="select-numcards">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "15", "20", "25"].map((n) => (
                    <SelectItem key={n} value={n}>{n} cards</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={(!topic && !notes) || generateFlashcards.isPending} className="w-full" data-testid="btn-generate">
              {generateFlashcards.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><BookOpen className="w-4 h-4 mr-2" /> Generate Flashcards</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const card = cards[current];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{cardTopic}</Badge>
          <span className="text-sm text-muted-foreground">{current + 1} / {cards.length}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setCards([]); setSaved(false); }} data-testid="btn-new">New Set</Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saved || saveSet.isPending} data-testid="btn-save">
            <Save className="w-4 h-4 mr-1" /> {saved ? "Saved!" : "Save"}
          </Button>
        </div>
      </div>

      <div
        className="relative cursor-pointer mb-6"
        onClick={() => setFlipped(!flipped)}
        data-testid="card-flip"
        style={{ perspective: "1000px" }}
      >
        <div className={cn("transition-transform duration-500 relative", flipped ? "[transform:rotateY(180deg)]"  : "")} style={{ transformStyle: "preserve-3d" }}>
          <div className="bg-card border border-border rounded-2xl shadow-md p-8 min-h-52 flex flex-col items-center justify-center text-center backface-hidden">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Front</span>
            <p className="text-xl font-semibold leading-relaxed">{card.front}</p>
            <p className="text-xs text-muted-foreground mt-4">Click to reveal answer</p>
          </div>
          <div className="absolute inset-0 bg-primary rounded-2xl shadow-md p-8 min-h-52 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-4">Back</span>
            <p className="text-xl font-semibold text-white leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={current === 0} data-testid="btn-prev">
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFlipped(false)} data-testid="btn-reset-flip">
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
        <Button variant="outline" onClick={handleNext} disabled={current === cards.length - 1} data-testid="btn-next">
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="flex gap-1.5 justify-center mt-5">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setFlipped(false); }}
            data-testid={`dot-${i}`}
            className={cn("w-2 h-2 rounded-full transition-all", i === current ? "bg-primary w-4" : "bg-border hover:bg-muted-foreground")}
          />
        ))}
      </div>
    </div>
  );
}
