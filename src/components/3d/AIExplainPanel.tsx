import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, X, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { usePaywall } from "@/hooks/usePaywall";
import UpgradeModal from "@/components/UpgradeModal";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

interface AIExplainPanelProps {
  context: string; // what the user is currently viewing
  subject: string; // e.g. "Human Anatomy", "Solar System"
}

type Msg = { role: "user" | "assistant"; content: string };

const AIExplainPanel = ({ context, subject }: AIExplainPanelProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canAI, registerAIQuestion, isPro, limitAI, remainingAI } = usePaywall();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!canAI()) {
      setShowUpgrade(true);
      return;
    }
    registerAIQuestion();
    const userMsg: Msg = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";

    try {
      const systemMsg = { role: "system" as const, content: `You are an AI lab assistant helping a student explore a 3D model of ${subject}. They are currently viewing: ${context}. Give short, helpful, educational explanations. Use simple language. Maximum 3 sentences unless asked for more detail.` };

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [systemMsg, ...allMessages] }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    `What am I looking at?`,
    `Explain how this works`,
    `Why is this important?`,
  ];

  return (
    <>
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-2xl flex items-center justify-center shadow-xl transition-colors ${
          open ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground glow-primary"
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-80 max-h-[60vh] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-3 border-b border-border/50 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold">AI Lab Assistant</span>
              {!isPro ? (
                <span className="text-[9px] text-muted-foreground ml-auto">{remainingAI}/{limitAI} free</span>
              ) : (
                <span className="text-[9px] text-muted-foreground ml-auto">Ask about {subject}</span>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[40vh]">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Brain className="h-8 w-8 text-primary/30 mx-auto mb-2" />
                  <p className="text-[11px] text-muted-foreground">Ask me anything about this 3D model!</p>
                  <div className="mt-3 space-y-1.5">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-secondary/50 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-xs prose-invert max-w-none [&_p]:m-0 [&_p]:text-[11px]">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-xl px-3 py-2">
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="p-2 border-t border-border/50 flex gap-1.5"
            >
              <Input
                placeholder="Ask about this model..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-8 text-xs rounded-lg bg-secondary/50 border-0"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-8 w-8 rounded-lg shrink-0" disabled={loading || !input.trim()}>
                <Send className="h-3 w-3" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} feature="ai" />
    </>
  );
};

export default AIExplainPanel;