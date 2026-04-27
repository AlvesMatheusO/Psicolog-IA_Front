"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Brain, MoreVertical } from "lucide-react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const MAX_MESSAGES = 20; // 🔥 evita estourar memória

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou seu assistente de PsicologIA. Não sou um substituto para um profissional, mas estou aqui para ajudar. Em casos mais graves, procure um profissional ou ligue 188 ou acesse [CVV](https://cvv.org.br/).",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 🔗 transforma links automáticos em markdown
  const formatLinks = (text: string) => {
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => `[${url}](${url})`
    );
  };

  // API
  const fetchAIResponse = async (userText: string) => {
    try {
      const response = await fetch("https://psicologia-rag.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      const rawText = await response.text();

      try {
        const data = JSON.parse(rawText);
        return data.text || data.message || rawText;
      } catch {
        return rawText;
      }
    } catch {
      return "Erro ao conectar com a IA.";
    }
  };

  // 🔥 função segura para adicionar mensagens
  const addMessage = (message: Message) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      return updated.slice(-MAX_MESSAGES); // limite
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;

    addMessage({
      id: Date.now().toString(),
      text: userText,
      sender: "user",
      timestamp: new Date(),
    });

    setInput("");
    setIsTyping(true);

    const aiText = await fetchAIResponse(userText);

    setIsTyping(false);

    addMessage({
      id: (Date.now() + 1).toString(),
      text: aiText,
      sender: "ai",
      timestamp: new Date(),
    });
  };

  const sendPill = async (text: string) => {
    setIsTyping(true);

    addMessage({
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    });

    const aiText = await fetchAIResponse(text);

    setIsTyping(false);

    addMessage({
      id: (Date.now() + 1).toString(),
      text: aiText,
      sender: "ai",
      timestamp: new Date(),
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-400" />
          <h2 className="font-bold">PsicologIA</h2>
        </div>
        <MoreVertical />
      </header>

      {/* CHAT */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-800"
              }`}
            >
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {children}
                    </a>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  li: ({ children }) => (
                    <li className="ml-4 list-disc mb-1">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-blue-600">
                      {children}
                    </strong>
                  ),
                }}
              >
                {formatLinks(msg.text)}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isTyping && (
          <p className="text-sm text-gray-400">Digitando...</p>
        )}
      </div>

      {/* PILLS */}
      <div className="p-4 flex gap-2 flex-wrap">
        {[
          "Preciso desabafar...",
          "Me dê dicas de relaxamento.",
          "Como lidar com o estresse?",
        ].map((text, i) => (
          <button
            key={i}
            onClick={() => sendPill(text)}
            className="px-4 py-2 bg-white rounded-full shadow text-sm hover:bg-gray-100"
          >
            {text}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-4 flex gap-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-3 border rounded-lg"
          placeholder="Digite sua mensagem..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 rounded-lg flex items-center"
        >
          <Send />
        </button>
      </div>
    </div>
  );
}