import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/lib/authContext";
import Sidebar from "@/components/Sidebar";
import ChatPage from "@/pages/ChatPage";
import QuizPage from "@/pages/QuizPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import SummarizerPage from "@/pages/SummarizerPage";
import ImagePage from "@/pages/ImagePage";
import NotesPage from "@/pages/NotesPage";
import MindmapPage from "@/pages/MindmapPage";
import TranslatorPage from "@/pages/TranslatorPage";
import CalculatorPage from "@/pages/CalculatorPage";
import HistoryPage from "@/pages/HistoryPage";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect to="/sign-in" />;
  return <Component />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Redirect to="/chat" />;
  return <LandingPage />;
}

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  const isAuthPage = location.startsWith("/sign-in") || location.startsWith("/sign-up");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {user && !isAuthPage && <Sidebar />}
      <div className={`flex-1 ${user && !isAuthPage ? "ml-64" : ""}`}>
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in" component={() => <AuthPage mode="sign-in" />} />
          <Route path="/sign-up" component={() => <AuthPage mode="sign-up" />} />
          <Route path="/chat" component={() => <ProtectedRoute component={ChatPage} />} />
          <Route path="/quiz" component={() => <ProtectedRoute component={QuizPage} />} />
          <Route path="/flashcards" component={() => <ProtectedRoute component={FlashcardsPage} />} />
          <Route path="/summarizer" component={() => <ProtectedRoute component={SummarizerPage} />} />
          <Route path="/image" component={() => <ProtectedRoute component={ImagePage} />} />
          <Route path="/notes" component={() => <ProtectedRoute component={NotesPage} />} />
          <Route path="/mindmap" component={() => <ProtectedRoute component={MindmapPage} />} />
          <Route path="/translator" component={() => <ProtectedRoute component={TranslatorPage} />} />
          <Route path="/calculator" component={() => <ProtectedRoute component={CalculatorPage} />} />
          <Route path="/history" component={() => <ProtectedRoute component={HistoryPage} />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
