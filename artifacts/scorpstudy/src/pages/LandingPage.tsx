import { Link } from "wouter";
import { GraduationCap, MessageSquare, Brain, BookOpen, FileText, Image, StickyNote, Network, Languages, Calculator, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MessageSquare, label: "AI Chat", desc: "Ask anything to Bishal's Assistant", color: "bg-blue-100 text-blue-600" },
  { icon: Brain, label: "Quiz Generator", desc: "Generate quizzes on any topic", color: "bg-purple-100 text-purple-600" },
  { icon: BookOpen, label: "Flashcards", desc: "Smart flashcards for memorization", color: "bg-green-100 text-green-600" },
  { icon: FileText, label: "PDF Summarizer", desc: "Summarize documents instantly", color: "bg-orange-100 text-orange-600" },
  { icon: Image, label: "Image Generator", desc: "Create study diagrams with AI", color: "bg-pink-100 text-pink-600" },
  { icon: StickyNote, label: "Smart Notes", desc: "AI-enhanced note taking", color: "bg-yellow-100 text-yellow-600" },
  { icon: Network, label: "Mind Maps", desc: "Visual knowledge organization", color: "bg-cyan-100 text-cyan-600" },
  { icon: Languages, label: "Translator", desc: "Translate study materials", color: "bg-indigo-100 text-indigo-600" },
  { icon: Calculator, label: "Calculator", desc: "Scientific calculator + AI formulas", color: "bg-red-100 text-red-600" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900">ScorpStudy</span>
              <span className="text-xs text-muted-foreground ml-1">by Bishal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="outline" size="sm" data-testid="btn-signin">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" data-testid="btn-signup">Get Started <ArrowRight className="ml-1 w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section className="py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Multi-Provider AI (Groq, Gemini, OpenAI)
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Study Smarter with
            <span className="text-primary block">AI-Powered Tools</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            ScorpStudy by Bishal gives college students 10+ AI-powered study tools in one place.
            Chat, quiz, summarize, and create — all for free.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" data-testid="btn-getstarted" className="px-8 shadow-lg shadow-blue-200">
                Start Studying Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" data-testid="btn-signin-hero">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">Everything You Need to Ace Your Studies</h2>
          <p className="text-gray-500 text-center mb-12">10 powerful AI tools, all in one place</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="bg-primary rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Study Smarter?</h2>
            <p className="text-blue-100 mb-8 text-lg">Join thousands of students using ScorpStudy by Bishal</p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" data-testid="btn-signup-footer" className="px-10">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-100 py-8 text-center text-sm text-gray-400">
        <p>ScorpStudy by Bishal &copy; 2024. Built with ❤️ for students.</p>
      </footer>
    </div>
  );
}
