import { useState } from "react";
import { useUser } from "@clerk/react";
import { useGenerateQuiz, useSaveQuizResult } from "@workspace/api-client-react";
import { Brain, Trophy, RotateCcw, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  type: string;
}

type QuizState = "setup" | "taking" | "results";

export default function QuizPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const generateQuiz = useGenerateQuiz();
  const saveResult = useSaveQuizResult();

  const [state, setState] = useState<QuizState>("setup");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizTopic, setQuizTopic] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    try {
      const result = await generateQuiz.mutateAsync({
        data: { topic, notes, numQuestions: parseInt(numQuestions), difficulty, questionType, userId: user.id }
      });
      const qs = result.questions as QuizQuestion[];
      setQuestions(qs);
      setQuizTopic(result.topic || topic);
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setShowAnswer(false);
      setState("taking");
    } catch {
      toast({ title: "Error", description: "Failed to generate quiz. Try again.", variant: "destructive" });
    }
  };

  const handleAnswer = (answer: string) => {
    if (showAnswer) return;
    setSelected(answer);
    setShowAnswer(true);
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      const score = answers.filter((a, i) => a === questions[i].correctAnswer).length;
      const percentage = Math.round((score / questions.length) * 100);
      try {
        await saveResult.mutateAsync({
          data: { topic: quizTopic, score, total: questions.length, percentage, difficulty, questionType, userId: user?.id ?? "" }
        });
      } catch { /* silent */ }
      setState("results");
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (state === "results") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="text-center shadow-lg">
          <CardContent className="pt-10 pb-8">
            <Trophy className={cn("w-16 h-16 mx-auto mb-4", percentage >= 80 ? "text-yellow-500" : percentage >= 60 ? "text-blue-500" : "text-gray-400")} />
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-muted-foreground mb-6">Topic: {quizTopic}</p>
            <div className="text-5xl font-extrabold text-primary mb-2">{percentage}%</div>
            <p className="text-lg text-muted-foreground mb-6">{score} / {questions.length} correct</p>
            <Progress value={percentage} className="mb-6" />
            <div className="space-y-3 text-left mb-6">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {answers[i] === q.correctAnswer
                    ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                  <span className="text-foreground">{q.question}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => setState("setup")} className="w-full" data-testid="btn-retake">
              <RotateCcw className="w-4 h-4 mr-2" /> Take Another Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "taking" && questions.length > 0) {
    const q = questions[current];
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="secondary">{quizTopic}</Badge>
          <span className="text-sm font-medium text-muted-foreground">{current + 1} / {questions.length}</span>
        </div>
        <Progress value={((current + 1) / questions.length) * 100} className="mb-6" />
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold mb-6 leading-relaxed">{q.question}</p>
            {q.type === "multiple_choice" || q.type === "true_false" ? (
              <div className="space-y-3">
                {(q.options || []).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={showAnswer}
                    data-testid={`option-${opt}`}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium",
                      !showAnswer && "hover:border-primary hover:bg-blue-50",
                      showAnswer && opt === q.correctAnswer && "border-green-500 bg-green-50 text-green-800",
                      showAnswer && opt === selected && opt !== q.correctAnswer && "border-red-400 bg-red-50 text-red-800",
                      !showAnswer && "border-border bg-background",
                      showAnswer && opt !== q.correctAnswer && opt !== selected && "border-border opacity-60"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your answer..."
                  value={selected || ""}
                  onChange={(e) => setSelected(e.target.value)}
                  disabled={showAnswer}
                  data-testid="input-answer"
                  rows={3}
                />
                {!showAnswer && (
                  <Button onClick={() => handleAnswer(selected || "")} disabled={!selected} data-testid="btn-submit-answer">
                    Submit Answer
                  </Button>
                )}
                {showAnswer && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    <strong>Correct Answer:</strong> {q.correctAnswer}
                  </div>
                )}
              </div>
            )}
            {showAnswer && q.explanation && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
            {showAnswer && (
              <Button onClick={handleNext} className="mt-4 w-full" data-testid="btn-next">
                {current < questions.length - 1 ? "Next Question →" : "See Results"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Quiz Generator</h1>
          <p className="text-sm text-muted-foreground">AI-powered quizzes from any topic</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label htmlFor="quiz-topic">Topic</Label>
            <Input id="quiz-topic" placeholder="e.g. Photosynthesis, World War II, Calculus..." value={topic} onChange={(e) => setTopic(e.target.value)} data-testid="input-topic" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="quiz-notes">Notes / Context (optional)</Label>
            <Textarea id="quiz-notes" placeholder="Paste your notes here for a more personalized quiz..." value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-notes" className="mt-1" rows={4} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Questions</Label>
              <Select value={numQuestions} onValueChange={setNumQuestions}>
                <SelectTrigger className="mt-1" data-testid="select-questions">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["3", "5", "8", "10", "15"].map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="mt-1" data-testid="select-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger className="mt-1" data-testid="select-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True / False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={(!topic && !notes) || generateQuiz.isPending} className="w-full" data-testid="btn-generate">
            {generateQuiz.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Quiz...</> : <><Brain className="w-4 h-4 mr-2" /> Generate Quiz</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
