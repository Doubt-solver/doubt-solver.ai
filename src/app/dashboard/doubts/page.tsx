"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, Loader2 } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const suggestedQuestions = [
    "What is photosynthesis? Explain in simple terms",
    "Explain Newton's 3 laws of motion with examples",
    "How to solve quadratic equations step by step?",
    "Why do we have seasons on Earth?",
    "What is the difference between mitosis and meiosis?",
    "Explain Ohm's law with a diagram",
    "What are the causes of the French Revolution?",
    "How does the human digestive system work?",
];

export default function DoubtsPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isStreaming) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text.trim(),
        };

        const assistantId = (Date.now() + 1).toString();
        const assistantMsg: Message = {
            id: assistantId,
            role: "assistant",
            content: "",
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setInput("");
        setIsStreaming(true);

        try {
            // Build chat history (last 10 messages for context)
            const chatHistory = messages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch("/api/doubts/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: text.trim(),
                    chatHistory,
                    grade: "Class 10",
                }),
            });

            if (!res.ok) {
                throw new Error("API request failed");
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let fullText = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullText += chunk;

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantId ? { ...m, content: fullText } : m
                        )
                    );
                }
            }
        } catch {
            // Fallback response if API fails
            const fallbackResponse =
                "I'm having trouble connecting to the AI right now. Please make sure your Gemini API key is set up in `.env.local`. In the meantime, you can try rephrasing your question or check the textbook for this topic.\n\n**Setup tip:** Add your `GEMINI_API_KEY` to `.env.local` and restart the dev server.";

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fallbackResponse } : m
                )
            );
        }

        setIsStreaming(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 40px)",
            }}
        >
            <div className="page-header" style={{ flexShrink: 0 }}>
                <h1>🤖 AI Doubt Solver</h1>
                <p>Ask any question — your AI study buddy is here to help!</p>
            </div>

            {/* Chat Messages */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            textAlign: "center",
                            padding: "40px 20px",
                        }}
                    >
                        <div style={{ fontSize: 56, marginBottom: 16 }}>🧠</div>
                        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>
                            Hi! I&apos;m your AI Study Buddy
                        </h2>
                        <p className="text-muted" style={{ marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
                            I use AI (powered by Gemini) to give you syllabus-aligned
                            answers with textbook references. Ask me anything!
                        </p>

                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                                justifyContent: "center",
                                maxWidth: 600,
                                margin: "0 auto",
                            }}
                        >
                            {suggestedQuestions.map((q, i) => (
                                <motion.button
                                    key={i}
                                    className="btn btn-outline btn-sm"
                                    onClick={() => sendMessage(q)}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={{ fontSize: 13 }}
                                >
                                    <Sparkles size={12} /> {q}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "flex-start",
                                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                            }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    background:
                                        msg.role === "assistant"
                                            ? "linear-gradient(135deg, var(--primary-green), var(--primary-blue))"
                                            : "var(--bg-elevated)",
                                    border: msg.role === "user" ? "2px solid var(--border-default)" : "none",
                                }}
                            >
                                {msg.role === "assistant" ? (
                                    <Bot size={18} color="white" />
                                ) : (
                                    <User size={18} />
                                )}
                            </div>

                            <div
                                className="card"
                                style={{
                                    maxWidth: "75%",
                                    padding: "14px 18px",
                                    background:
                                        msg.role === "user"
                                            ? "var(--bg-elevated)"
                                            : "var(--bg-card)",
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.7,
                                    fontSize: 15,
                                }}
                            >
                                {msg.content || (
                                    <div className="flex items-center gap-2">
                                        <Loader2
                                            size={16}
                                            style={{
                                                color: "var(--primary-green)",
                                                animation: "spin 1s linear infinite",
                                            }}
                                        />
                                        <span className="text-muted text-sm">Thinking...</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div
                style={{
                    flexShrink: 0,
                    padding: "16px 0 8px",
                    borderTop: "1px solid var(--border-subtle)",
                }}
            >
                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", gap: 10 }}
                >
                    <input
                        className="form-input"
                        placeholder="Ask a doubt..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isStreaming}
                        style={{ flex: 1 }}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isStreaming || !input.trim()}
                        style={{
                            opacity: isStreaming || !input.trim() ? 0.5 : 1,
                            cursor: isStreaming || !input.trim() ? "not-allowed" : "pointer",
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
}
