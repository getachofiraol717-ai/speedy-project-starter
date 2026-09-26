import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Brain, Trash2, Loader2, Sparkles, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { usePaywall } from "@/hooks/usePaywall";
import UpgradeModal from "@/components/UpgradeModal";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

async function streamChat({ messages, onDelta, onDone, onError }: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { onDone(); return; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const quickPrompts = [
  "Explain photosynthesis simply",
  "Help me understand Newton's laws",
  "Quiz me on the periodic table",
  "Create a study plan for biology",
];

const AITutor = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canAI, registerAIQuestion, isPro, limitAI, remainingAI } = usePaywall();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!canAI()) {
      setShowUpgrade(true);
      return;
    }
    registerAIQuestion();
    const userMsg: Msg = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: updated,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          toast.error(msg);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error("Failed to connect to AI Tutor");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-6 shrink-0 bg-card/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-[10px]">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-[10px] bg-accent/20 flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-accent" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">AI Tutor</h1>
              <p className="text-[10px] text-muted-foreground">Powered by AI • Ask anything</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPro && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground font-medium">
              {remainingAI} / {limitAI} free
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-[10px] text-xs"
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Hey! I'm your AI Tutor 👋</h2>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
              Ask me anything about science, math, or technology. I can explain topics, generate quizzes, create study plans, and more.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-lg">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="px-3 py-2 rounded-xl bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border/50"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border/50 p-4 bg-card/50 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask your AI Tutor anything..."
            className="rounded-xl bg-secondary/50 border-0"
            disabled={isLoading}
          />
          <Button onClick={() => send(input)} disabled={!input.trim() || isLoading} className="rounded-xl px-4">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} feature="ai" />
    </div>
  );
};

export default AITutor;
