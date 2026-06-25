import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/react";
import { useAiChat } from "@workspace/api-client-react";
import { Send, Bot, User, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUBJECTS = ["General", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Computer Science", "English", "Economics", "Philosophy"];

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm **Bishal's Assistant** 👋. I'm here to help you study. Ask me anything about your subjects, or let me help you understand complex topics!" }
  ]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("General");
  const bottomRef = useRef<HTMLDivElement>(null);
  const chat = useAiChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    try {
      const result = await chat.mutateAsync({
        data: {
          message: userMsg.content,
          subject: subject !== "General" ? subject : undefined,
          conversationHistory: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          userId: user.id,
        },
      });
      setMessages([...newMessages, { role: "assistant", content: result.response }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error && err.message.includes("limit")
        ? "Daily AI limit reached (30/day). Come back tomorrow! 🌙"
        : "Something went wrong. Please try again.";
      setMessages([...newMessages, { role: "assistant", content: errMsg }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Bishal's Assistant</h1>
            <p className="text-xs text-muted-foreground">AI Study Companion</p>
          </div>
        </div>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-44" data-testid="select-subject">
            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")} data-testid={`msg-${msg.role}-${i}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={cn(
              "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-card border border-border rounded-tl-sm shadow-sm"
            )}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:m-0 prose-headings:mb-1"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        {chat.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-muted-foreground">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-4 bg-card">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... (Enter to send, Shift+Enter for newline)"
            className="resize-none min-h-[48px] max-h-32"
            rows={1}
            data-testid="input-chat"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chat.isPending}
            size="icon"
            className="flex-shrink-0 h-12 w-12"
            data-testid="btn-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
