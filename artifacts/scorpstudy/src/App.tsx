import { ClerkProvider, SignIn, SignUp, Show, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
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
import NotFound from "@/pages/not-found";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  baseTheme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#2563EB",
    colorForeground: "#1e3a5f",
    colorMutedForeground: "#64748b",
    colorBackground: "#f0f6ff",
    colorInput: "#e2ecff",
    colorInputForeground: "#1e3a5f",
    colorDanger: "#ef4444",
    colorNeutral: "#64748b",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.95rem",
    borderRadius: "0.625rem",
  },
  elements: {
    cardBox: "w-[440px] max-w-full shadow-lg rounded-xl bg-white border border-blue-100",
    headerTitle: "text-gray-900 font-bold",
    headerSubtitle: "text-gray-500",
    socialButtonsBlockButtonText: "text-gray-700 font-medium",
    formFieldLabel: "text-gray-700 font-medium",
    footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-400",
    identityPreviewText: "text-gray-700",
    identityPreviewEditButton: "text-blue-600",
  },
};

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/chat" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function Router() {
  const { isSignedIn } = useUser();
  const [location] = useLocation();
  const isAuthPage = location.startsWith("/sign-in") || location.startsWith("/sign-up");

  return (
    <div className="flex min-h-screen bg-background">
      {isSignedIn && !isAuthPage && <Sidebar />}
      <div className={`flex-1 ${isSignedIn && !isAuthPage ? "ml-64" : ""}`}>
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={() => (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
              <SignIn routing="path" path={`${basePath}/sign-in`} />
            </div>
          )} />
          <Route path="/sign-up/*?" component={() => (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
              <SignUp routing="path" path={`${basePath}/sign-up`} />
            </div>
          )} />
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
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      routerPush={(to) => { window.history.pushState({}, "", to); window.dispatchEvent(new PopStateEvent("popstate")); }}
      routerReplace={(to) => { window.history.replaceState({}, "", to); window.dispatchEvent(new PopStateEvent("popstate")); }}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signInFallbackRedirectUrl={`${basePath}/chat`}
      signUpFallbackRedirectUrl={`${basePath}/chat`}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
