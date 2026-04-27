"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Brain, MoreVertical, User, Sparkles } from "lucide-react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou seu assistente de PsicologIA. Como você está se sentindo hoje?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [riskLevel, setRiskLevel] = useState(1); // 1: Normal, 2: Alerta, 3: Crítico
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchAIResponse = async (userText: string) => {
    try {
      const response = await fetch("https://psicologia-rag.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com a IA");
      }

      const rawText = await response.text();
      try {
        const data = JSON.parse(rawText);
        return data.text || data.message || rawText;
      } catch (e) {
        return rawText;
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Desculpe, estou tendo problemas para me conectar no momento. Poderia tentar novamente em instantes?";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const aiText = await fetchAIResponse(userText);

    setIsTyping(false);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiText,
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  const sendPill = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const aiText = await fetchAIResponse(text);

    setIsTyping(false);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiText,
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="font-bold leading-none">PsicologIA</h2>
            <span className="text-[10px] opacity-70">
              Ambiente de Produção - Render
            </span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-secondary dark:border-white/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="py-1.5">
                  <div className="px-3 py-1 text-[10px] font-bold text-foreground/50 dark:text-white/30 uppercase tracking-widest mb-1">
                    Configurações
                  </div>
                  <button
                    onClick={() => {
                      setTheme(theme === "light" ? "dark" : "light");
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      {theme === "light" ? (
                        <Moon className="w-4 h-4 text-primary" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="text-xs font-semibold text-primary-dark dark:text-white">
                        {theme === "light" ? "Modo Escuro" : "Modo Claro"}
                      </span>
                    </div>
                    <div
                      className={`w-8 h-4.5 px-0.5 rounded-full flex items-center transition-colors duration-300 ${theme === "dark" ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
                    >
                      <div
                        className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === "dark" ? "translate-x-3.5" : "translate-x-0"}`}
                      ></div>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary dark:hover:bg-white/5 transition-colors text-foreground/70 dark:text-white/60 text-xs">
                    <Info className="w-4 h-4" />
                    <span className="font-semibold">Informações</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 py-8 space-y-8 scrollbar-thin scrollbar-thumb-primary/20 bg-background"
      >
        <div className="max-w-3xl mx-auto space-y-8 pb-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mt-auto shadow-sm ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-white border text-blue-600"}`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl text-[15px] ${msg.sender === "user" ? "bg-blue-600 text-white shadow-blue-200" : "bg-white border border-slate-200 text-slate-800 shadow-sm"}`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 ml-11 text-slate-400 text-xs italic">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              PsicologIA está processando...
            </div>
          )}
        </div>
      </div>

      {/* Action Zone (Pills + Input) */}
      <div className="w-full p-4 md:p-6 bg-background border-t border-secondary dark:border-white/5">
        <div className="max-w-3xl mx-auto flex flex-col">
          {/* Pills Section (Glassmorphism) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pb-4">
            {[
              "Preciso desabafar...",
              "Me dê dicas de relaxamento.",
              "Como lidar com o estresse?",
            ].map((text, i) => (
              <button
                key={i}
                onClick={() => sendPill(text)}
                className="w-full px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[13px] font-semibold text-primary-dark hover:bg-white hover:shadow-md transition-all shadow-sm text-center truncate"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Input Bar (Bright Glass) */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-foreground/40">
              <button className="hover:text-primary transition-colors p-1">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Como você está se sentindo?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                riskLevel === 3
                  ? "Conversa suspensa por segurança"
                  : "Como você está se sentindo?"
              }
              disabled={isLoading || riskLevel === 3}
              className="flex-grow p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:cursor-not-allowed"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-2 text-foreground/30 hover:text-primary transition-colors hidden sm:block">
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-bold"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-foreground/60 mt-3 font-bold uppercase tracking-widest">
          Ambiente Seguro & Sigiloso
        </p>
      </div>

      {/* Floating Trust Badge */}
      <div className="fixed bottom-24 right-6 pointer-events-none md:pointer-events-auto group">
        <div className="bg-white/80 backdrop-blur-md border border-white/40 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 transform transition-transform hover:scale-105">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold text-primary-dark whitespace-nowrap uppercase tracking-tighter">
            IA de Apoio - Não substitui terapia
          </span>
        </div>
      </div>
    </div>
  );
}
