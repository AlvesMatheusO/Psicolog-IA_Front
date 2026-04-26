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
    { id: "1", text: "Olá! Sou seu assistente de PsicologIA. Como você está se sentindo hoje?", sender: "ai", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState(1); // 1: Normal, 2: Alerta, 3: Crítico
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // FUNÇÃO DE ENVIO COM INTEGRAÇÃO REAL (PESSOA 5)
  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading || riskLevel === 3) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // CHAMADA PARA O BACKEND OFICIAL (Render)
      const response = await fetch("https://psicologia-rag.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error("Erro na resposta do servidor");

      // AJUSTE PARA TEXTO PURO (Evita o erro de SyntaxError no JSON)
      const dataText = await response.text();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: dataText || "Desculpe, não consegui processar sua resposta agora.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Lógica de monitoramento de Risco (Pessoa 4)
      const prompt = textToSend.toLowerCase();
      const termosCriticos = ["morrer", "suicidio", "me matar", "tirar minha vida", "me machucar"];
      const termosApoio = ["triste", "sozinho", "mal", "ajuda", "angustiado", "terminei"];

      if (termosCriticos.some(termo => prompt.includes(termo))) {
        setRiskLevel(3);
      } else if (termosApoio.some(termo => prompt.includes(termo))) {
        setRiskLevel(2);
      }

    } catch (error) {
      console.error("Erro de Integração:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "O servidor demorou a responder ou enviou um formato inválido. Tente novamente em alguns segundos.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="font-bold leading-none">PsicologIA</h2>
            <span className="text-[10px] opacity-70">Ambiente de Produção - Render</span>
          </div>
        </div>
        <MoreVertical className="w-5 h-5 opacity-50 cursor-pointer" />
      </header>

      {/* Área do Chat */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Banners de Risco */}
          {riskLevel === 2 && (
            <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl text-sm shadow-sm animate-fade-in">
              <strong>Apoio:</strong> Notei que você está passando por um momento difícil. Estou aqui para te ouvir.
            </div>
          )}

          {riskLevel === 3 && (
            <div className="bg-red-600 text-white p-5 rounded-xl text-sm shadow-lg animate-bounce text-center">
              <p className="font-bold mb-1 underline">VOCÊ NÃO ESTÁ SOZINHO!</p>
              <p>Procure ajuda agora mesmo. Ligue para o <strong>CVV (188)</strong> ou acesse cvv.org.br.</p>
            </div>
          )}

          {/* Lista de Mensagens */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-auto shadow-sm ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-white border text-blue-600"}`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-[15px] ${msg.sender === "user" ? "bg-blue-600 text-white shadow-blue-200" : "bg-white border border-slate-200 text-slate-800 shadow-sm"}`}>
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

      {/* Rodapé e Input */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto space-y-4">
          
          {/* Sugestões Rápidas */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["Preciso desabafar", "Me sinto triste", "Dicas de relaxamento"].map((pill) => (
              <button 
                key={pill} 
                onClick={() => handleSend(pill)}
                disabled={isLoading || riskLevel === 3}
                className="whitespace-nowrap px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all disabled:opacity-30"
              >
                {pill}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={riskLevel === 3 ? "Conversa suspensa por segurança" : "Como você está se sentindo?"}
              disabled={isLoading || riskLevel === 3}
              className="flex-grow p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:cursor-not-allowed"
            />
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading || riskLevel === 3}
              className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-slate-300 disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest">Ambiente Seguro & Sigiloso</p>
        </div>
      </div>
    </div>
  );
}