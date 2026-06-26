import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import {
  MessageSquare, Brain, BookOpen, FileText, Image, StickyNote,
  Network, Languages, Calculator, History, LogOut, GraduationCap, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/chat", label: "AI Chat", icon: MessageSquare, color: "text-blue-500" },
  { path: "/quiz", label: "Quiz Generator", icon: Brain, color: "text-purple-500" },
  { path: "/flashcards", label: "Flashcards", icon: BookOpen, color: "text-green-500" },
  { path: "/summarizer", label: "PDF Summarizer", icon: FileText, color: "text-orange-500" },
  { path: "/image", label: "Image Generator", icon: Image, color: "text-pink-500" },
  { path: "/notes", label: "Smart Notes", icon: StickyNote, color: "text-yellow-500" },
  { path: "/mindmap", label: "Mind Map", icon: Network, color: "text-cyan-500" },
  { path: "/translator", label: "Translator", icon: Languages, color: "text-indigo-500" },
  { path: "/calculator", label: "Calculator", icon: Calculator, color: "text-red-500" },
  { path: "/history", label: "History", icon: History, color: "text-gray-500" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside data-testid="sidebar" className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sidebar-foreground text-sm leading-tight">ScorpStudy</p>
            <p className="text-xs text-muted-foreground">by Bishal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon, color }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <div
                data-testid={`nav-${path.replace("/", "")}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary-foreground" : color)} />
                <span className="text-sm font-medium flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-70" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Student"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          data-testid="btn-signout"
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => signOut()}
        >
          <LogOut className="w-3 h-3 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
