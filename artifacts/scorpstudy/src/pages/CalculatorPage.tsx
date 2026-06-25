import { useState } from "react";
import { useUser } from "@clerk/react";
import { useGetFormula } from "@workspace/api-client-react";
import { Calculator, Brain, Loader2, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const BUTTONS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

const SCI_BUTTONS = [
  ["sin", "cos", "tan", "π"],
  ["log", "ln", "e", "√"],
  ["x²", "x³", "1/x", "!"],
  ["(", ")", "^", "EXP"],
];

export default function CalculatorPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const getFormula = useGetFormula();

  const [display, setDisplay] = useState("0");
  const [formula, setFormula] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [isScientific, setIsScientific] = useState(false);

  const handleButton = (btn: string) => {
    if (btn === "C") {
      setDisplay("0");
      setFormula("");
      return;
    }
    if (btn === "=") {
      try {
        let expr = formula
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-")
          .replace(/π/g, String(Math.PI))
          .replace(/e(?![xp])/g, String(Math.E))
          .replace(/√(\d+\.?\d*)/g, (_m: string, n: string) => String(Math.sqrt(Number(n))))
          .replace(/sin\(([^)]+)\)/g, (_m: string, n: string) => String(Math.sin(Number(n) * Math.PI / 180)))
          .replace(/cos\(([^)]+)\)/g, (_m: string, n: string) => String(Math.cos(Number(n) * Math.PI / 180)))
          .replace(/tan\(([^)]+)\)/g, (_m: string, n: string) => String(Math.tan(Number(n) * Math.PI / 180)))
          .replace(/log\(([^)]+)\)/g, (_m: string, n: string) => String(Math.log10(Number(n))))
          .replace(/ln\(([^)]+)\)/g, (_m: string, n: string) => String(Math.log(Number(n))))
          .replace(/(\d+)²/g, (_m: string, n: string) => String(Math.pow(Number(n), 2)))
          .replace(/(\d+)³/g, (_m: string, n: string) => String(Math.pow(Number(n), 3)))
          .replace(/1\/(\d+)/g, (_m: string, n: string) => String(1 / Number(n)));

        // eslint-disable-next-line no-new-func
        const result = new Function("return " + expr)();
        const resultStr = String(parseFloat(result.toFixed(10)));
        setHistory((h) => [`${formula} = ${resultStr}`, ...h.slice(0, 9)]);
        setDisplay(resultStr);
        setFormula(resultStr);
      } catch {
        setDisplay("Error");
        setFormula("");
      }
      return;
    }
    if (btn === "⌫") {
      const newFormula = formula.slice(0, -1) || "0";
      setFormula(newFormula);
      setDisplay(newFormula);
      return;
    }
    if (btn === "±") {
      if (formula.startsWith("-")) {
        setFormula(formula.slice(1));
        setDisplay(formula.slice(1));
      } else {
        setFormula("-" + formula);
        setDisplay("-" + formula);
      }
      return;
    }
    if (btn === "%") {
      try {
        // eslint-disable-next-line no-new-func
        const val = new Function("return " + formula)() / 100;
        setFormula(String(val));
        setDisplay(String(val));
      } catch { /* silent */ }
      return;
    }

    const toAppend = btn === "x²" ? "²" : btn === "x³" ? "³" : btn;
    const newFormula = formula === "0" || formula === "Error" ? toAppend : formula + toAppend;
    setFormula(newFormula);
    setDisplay(newFormula);
  };

  const handleAiFormula = async () => {
    if (!user || !aiQuestion.trim()) return;
    try {
      const result = await getFormula.mutateAsync({ data: { question: aiQuestion, userId: user.id } });
      setAiResult(result.response);
    } catch {
      toast({ title: "Error", description: "Failed to get formula.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Calculator</h1>
          <p className="text-sm text-muted-foreground">Scientific calculator + AI formula explainer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={() => setIsScientific(!isScientific)} data-testid="btn-toggle-sci" className="text-xs">
                  {isScientific ? "Basic" : "Scientific"}
                </Button>
                <div className="text-xs text-muted-foreground">{history[0] || ""}</div>
              </div>
              <div className="bg-muted rounded-lg p-4 mb-4 text-right">
                <p className="text-xs text-muted-foreground mb-1 truncate">{formula || "0"}</p>
                <p className="text-3xl font-bold text-foreground truncate" data-testid="display">{display}</p>
              </div>

              {isScientific && (
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {SCI_BUTTONS.flat().map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleButton(btn)}
                      data-testid={`sci-btn-${btn}`}
                      className="py-2 rounded-lg text-sm font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-4 gap-1.5">
                {BUTTONS.flat().map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleButton(btn)}
                    data-testid={`btn-${btn}`}
                    className={cn(
                      "py-4 rounded-lg text-base font-semibold transition-all active:scale-95",
                      btn === "=" ? "bg-primary text-primary-foreground hover:bg-primary/90 col-span-1" :
                      ["C", "±", "%"].includes(btn) ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" :
                      ["÷", "×", "−", "+"].includes(btn) ? "bg-orange-100 text-orange-700 hover:bg-orange-200" :
                      btn === "⌫" ? "bg-red-50 text-red-600 hover:bg-red-100" :
                      "bg-card hover:bg-muted border border-border"
                    )}
                  >
                    {btn === "⌫" ? <Delete className="w-4 h-4 mx-auto" /> : btn}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm">History</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {history.map((h, i) => (
                    <li key={i} className="text-xs text-muted-foreground font-mono">{h}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                AI Formula Helper
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="formula-q">Ask about any formula or concept</Label>
                <Input
                  id="formula-q"
                  placeholder="e.g. How do I calculate compound interest? What is Pythagoras theorem?"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiFormula()}
                  data-testid="input-formula"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAiFormula} disabled={!aiQuestion.trim() || getFormula.isPending} className="w-full" data-testid="btn-ask">
                {getFormula.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...</> : <><Brain className="w-4 h-4 mr-2" /> Explain Formula</>}
              </Button>
              {aiResult && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="prose prose-sm max-w-none prose-p:mt-0 text-foreground"><ReactMarkdown>{aiResult}</ReactMarkdown></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
