"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Brain, 
  ArrowLeft, 
  MoreVertical, 
  User, 
  Sparkles,
  Paperclip,
  Smile,
  ChevronLeft,
  ShieldCheck,
  Info,
  Moon,
  Sun
} from "lucide-react";
import Link from "next/link";

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
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Theme Management
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header (Darker Glass) */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shadow-sm border border-white/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white leading-none">Assistente PsicologIA</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-xs text-white/70 font-medium">Online agora</span>
              </div>
            </div>
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
                    <div className={`w-8 h-4.5 px-0.5 rounded-full flex items-center transition-colors duration-300 ${theme === "dark" ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === "dark" ? "translate-x-3.5" : "translate-x-0"}`}></div>
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
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-xl ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-auto shadow-sm ${
                  msg.sender === "user" ? "bg-primary text-white" : "bg-white text-primary border border-secondary"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                
                <div className={`relative px-5 py-3 rounded-2xl text-[15px] leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-primary text-white rounded-br-none shadow-md shadow-primary/10" 
                    : "bg-white text-primary-dark border border-white rounded-bl-none shadow-sm"
                }`}>
                  {msg.text}
                  <span className={`text-[10px] absolute -bottom-5 whitespace-nowrap opacity-60 ${msg.sender === "user" ? "right-0" : "left-0"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-white text-primary border border-secondary flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/40 shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                </div>
              </div>
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
              "Como lidar com o estresse?"
            ].map((text, i) => (
              <button 
                key={i} 
                onClick={() => sendPill(text)}
                className="w-full px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[13px] font-semibold text-primary-dark hover:bg-white hover:shadow-md transition-all shadow-sm text-center truncate"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Input Bar (Bright Glass) */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-foreground/40">
              <button className="hover:text-primary transition-colors p-1"><Paperclip className="w-5 h-5" /></button>
            </div>
            
            <input 
              type="text" 
              placeholder="Como você está se sentindo?" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full pl-14 pr-16 py-4 rounded-2xl border-2 border-white/80 bg-white/90 backdrop-blur-md focus:bg-white focus:border-primary/20 focus:outline-none transition-all placeholder:text-foreground/50 font-medium shadow-xl text-primary-dark shadow-primary/5"
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




