"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Brain, MoreVertical, User, Sparkles, AlertTriangle, Heart } from "lucide-react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

type RiskLevelType = 1 | 2 | 3;

const MAX_MESSAGES = 50; // Limite de mensagens em memória

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! 👋 Sou seu assistente de **PsicologIA**. Estou aqui para te ouvir e oferecer apoio.\n\n**Importante:** Não sou um substituto para um profissional de saúde mental. Em casos de crise ou pensamentos suicidas, procure ajuda imediata:\n\n- **CVV (Centro de Valorização da Vida):** [188](tel:188) ou [cvv.org.br](https://cvv.org.br/)\n- **SAMU:** 192\n- **Polícia:** 190\n\nComo você está se sentindo hoje?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState<RiskLevelType>(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
      }, 0);
    }
  }, [messages, isLoading]);

  // Transforma links automáticos em markdown
  const formatLinks = (text: string) => {
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => `[${url}](${url})`
    );
  };

  // Detecta nível de risco baseado nas palavras-chave
  const detectRiskLevel = (text: string): RiskLevelType => {
    const prompt = text.toLowerCase();

    const termosCriticos = [
      "morrer",
      "suicídio",
      "suicidio",
      "me matar",
      "tirar minha vida",
      "me machucar",
      "cortei",
      "envenenamento",
      "overdose",
      "não quero mais viver",
      "ninguém me ama",
    ];

    const termosApoio = [
      "triste",
      "depressão",
      "deprimido",
      "sozinho",
      "mal",
      "ajuda",
      "angustiado",
      "terminei",
      "sozinha",
      "anso",
      "medo",
      "pânico",
      "ansiedade",
    ];

    if (termosCriticos.some((termo) => prompt.includes(termo))) {
      return 3;
    }

    if (termosApoio.some((termo) => prompt.includes(termo))) {
      return 2;
    }

    return 1;
  };

  // Fetch de resposta do backend
  const fetchAIResponse = async (userText: string): Promise<string> => {
    try {
      const response = await fetch(
        "https://psicologia-rag.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userText }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawText = await response.text();

      // Tenta parsear JSON, se falhar retorna o texto puro
      try {
        const data = JSON.parse(rawText);
        return data.text || data.message || rawText;
      } catch {
        return rawText;
      }
    } catch (error) {
      console.error("Erro de Integração:", error);
      return "Desculpe, não consegui conectar ao servidor agora. Tente novamente em alguns instantes. Se o problema persistir, procure um profissional.";
    }
  };

  // Função segura para adicionar mensagens
  const addMessage = (message: Message) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      return updated.slice(-MAX_MESSAGES);
    });
  };

  // Handler principal de envio
  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;

    if (!textToSend.trim() || isLoading || riskLevel === 3) {
      return;
    }

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput("");

    // Detecta nível de risco
    const newRiskLevel = detectRiskLevel(textToSend);
    setRiskLevel(newRiskLevel);

    setIsLoading(true);

    try {
      const aiText = await fetchAIResponse(textToSend);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
      };

      addMessage(aiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Pill buttons sugeridos
  const suggestedPills = [
    "Preciso desabafar...",
    "Me dê dicas de relaxamento",
    "Como lidar com o estresse?",
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900 overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-blue-400 drop-shadow-lg" />
            <Heart className="w-3 h-3 text-red-400 absolute -bottom-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">PsicologIA</h2>
            <span className="text-xs opacity-60 font-medium">Espaço seguro de escuta</span>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 opacity-70" />
        </button>
      </header>

      {/* CHAT AREA */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 py-8 space-y-6"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)",
        }}
      >
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {/* RISK ALERT - CRITICAL */}
          {riskLevel === 3 && (
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-2xl shadow-2xl border-2 border-red-400 animate-pulse">
              <div className="flex gap-3 items-start">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-lg mb-2">Você não está sozinho! 💙</p>
                  <p className="text-sm mb-3">
                    Notei que você pode estar em um momento muito difícil. Por favor, procure ajuda profissional agora:
                  </p>
                  <div className="space-y-2 text-sm font-semibold">
                    <p>📞 <strong>CVV (Centro de Valorização da Vida):</strong> <a href="tel:188" className="bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">188</a> ou <a href="https://cvv.org.br/" target="_blank" rel="noopener noreferrer" className="bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">cvv.org.br</a></p>
                    <p>🚑 <strong>SAMU:</strong> 192</p>
                    <p>🚨 <strong>Polícia:</strong> 190</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RISK ALERT - ALERT */}
          {riskLevel === 2 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-md">
              <p className="text-amber-900 text-sm font-medium">
                <span className="inline-block mr-2">💛</span>
                Percebi que você está passando por um momento difícil. Estou aqui para te ouvir com todo o cuidado.
              </p>
            </div>
          )}

          {/* MESSAGES LIST */}
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              style={{
                animationDelay: `${index * 50}ms`,
              } as React.CSSProperties}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* AVATAR */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm font-semibold text-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "bg-gradient-to-br from-violet-100 to-blue-100 text-blue-600"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                {/* MESSAGE BUBBLE */}
                <div
                  className={`px-5 py-4 rounded-2xl text-[15px] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-800 shadow-md rounded-bl-none"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-semibold underline transition-opacity hover:opacity-80 ${
                            msg.sender === "user"
                              ? "text-blue-100"
                              : "text-blue-600"
                          }`}
                        >
                          {children}
                        </a>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic opacity-90">{children}</em>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2 last:mb-0 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2 last:mb-0 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                      h1: ({ children }) => (
                        <h1 className="font-bold text-lg mb-2">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-bold text-base mb-2">{children}</h2>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-current opacity-75 pl-3 italic mb-2">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {formatLinks(msg.text)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-bl-none shadow-md">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-2xl">
        <div className="max-w-3xl mx-auto w-full space-y-4">
          {/* QUICK PILLS */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestedPills.map((pill) => (
              <button
                key={pill}
                onClick={() => handleSend(pill)}
                disabled={isLoading || riskLevel === 3}
                className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:from-blue-50 hover:to-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* INPUT AREA */}
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={
                riskLevel === 3
                  ? "Procure ajuda profissional agora..."
                  : "Como você está se sentindo? (Shift+Enter para quebra de linha)"
              }
              disabled={isLoading || riskLevel === 3}
              className="flex-1 p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 placeholder-slate-400 text-slate-900"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || riskLevel === 3}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-300 hover:shadow-blue-400 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* FOOTER TEXT */}
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
              ✨ Ambiente seguro, sigiloso e acolhedor
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              PsicologIA não substitui atendimento profissional. Em caso de crise, ligue 188.
            </p>
          </div>
        </div>
      </div>

      {/* CUSTOM STYLES */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        /* Hide scrollbar but keep functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar for chat area */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.5);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(203, 213, 225, 0.8);
        }
      `}</style>
    </div>
  );
}