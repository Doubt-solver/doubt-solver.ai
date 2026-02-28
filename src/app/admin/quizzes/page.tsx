"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Clock, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

interface Quiz {
    id: string;
    title: string;
    subject: string;
    question_count: number;
    time_limit_min: number;
    is_published: boolean;
    created_at: string;
}

const SUBJECTS = ["Mathematics", "Science", "English", "Social Science", "Computer Science"];

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("Mathematics");
    const [timeLimit, setTimeLimit] = useState(30);
    const [saving, setSaving] = useState(false);

    // Load quizzes from API on mount
    useEffect(() => {
        fetch("/api/admin/quizzes")
            .then((r) => r.json())
            .then((d) => {
                if (d.quizzes) setQuizzes(d.quizzes.map((q: Record<string, unknown>) => ({
                    ...q,
                    question_count: Array.isArray(q.question_ids) ? (q.question_ids as unknown[]).length : 0,
                })));
            })
            .catch(() => { });
    }, []);

    const handleCreate = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/quizzes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), subject, question_ids: [], time_limit_min: timeLimit }),
            });
            const data = await res.json();
            const newQuiz: Quiz = {
                id: data.quiz?.id ?? Date.now().toString(),
                title: title.trim(),
                subject,
                question_count: 0,
                time_limit_min: timeLimit,
                is_published: false,
                created_at: new Date().toISOString(),
            };
            setQuizzes((prev) => [newQuiz, ...prev]);
        } catch {
            setQuizzes((prev) => [{ id: Date.now().toString(), title: title.trim(), subject, question_count: 0, time_limit_min: timeLimit, is_published: false, created_at: new Date().toISOString() }, ...prev]);
        }
        setTitle("");
        setShowForm(false);
        setSaving(false);
    };

    const togglePublish = async (id: string) => {
        const quiz = quizzes.find((q) => q.id === id);
        setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, is_published: !q.is_published } : q)));
        try {
            await fetch("/api/admin/quizzes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, is_published: !quiz?.is_published }),
            });
        } catch { }
    };

    const deleteQuiz = async (id: string) => {
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
        try {
            await fetch(`/api/admin/quizzes?id=${id}`, { method: "DELETE" });
        } catch { }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Quizzes</h1>
                    <p style={{ fontSize: 14, color: "#999" }}>Create and manage quizzes for students</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 20px", borderRadius: 12,
                        background: "#1A1A1A", color: "white",
                        border: "none", fontWeight: 700, fontSize: 14,
                        cursor: "pointer", fontFamily: "inherit",
                    }}
                >
                    <Plus size={16} /> Create Quiz
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            padding: 24, borderRadius: 16,
                            background: "white", border: "1px solid #EDE8E3",
                            marginBottom: 24, overflow: "hidden",
                        }}
                    >
                        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>New Quiz</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Quiz Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Chapter 5 Review"
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: 10,
                                        border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                                        background: "#FAFAF8",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Subject</label>
                                <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{
                                    width: "100%", padding: "10px 14px", borderRadius: 10,
                                    border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit", background: "#FAFAF8",
                                }}>
                                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Time (min)</label>
                                <input
                                    type="number" value={timeLimit}
                                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: 10,
                                        border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit", background: "#FAFAF8",
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={handleCreate} disabled={saving} style={{
                                padding: "10px 24px", borderRadius: 10,
                                background: "#1A1A1A", color: "white",
                                border: "none", fontWeight: 700, fontSize: 14,
                                cursor: "pointer", fontFamily: "inherit",
                            }}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : "Create Quiz"}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{
                                padding: "10px 24px", borderRadius: 10,
                                background: "white", color: "#666",
                                border: "1px solid #E5E0DB", fontWeight: 600, fontSize: 14,
                                cursor: "pointer", fontFamily: "inherit",
                            }}>Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {quizzes.length === 0 ? (
                <div style={{
                    padding: 48, borderRadius: 16,
                    background: "white", border: "1px solid #EDE8E3",
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No quizzes yet</div>
                    <p style={{ fontSize: 14, color: "#999" }}>Create your first quiz to assign to students.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {quizzes.map((q) => (
                        <div key={q.id} style={{
                            padding: 18, borderRadius: 14,
                            background: "white", border: "1px solid #EDE8E3",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{q.title}</div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <span style={{ padding: "2px 10px", borderRadius: 999, background: "#EFF6FF", color: "#2563EB", fontSize: 11, fontWeight: 600 }}>{q.subject}</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#999" }}>
                                        <Clock size={12} /> {q.time_limit_min} min
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => togglePublish(q.id)} style={{
                                    display: "flex", alignItems: "center", gap: 4,
                                    padding: "6px 14px", borderRadius: 8,
                                    border: "1px solid #E5E0DB", background: "white",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                    color: q.is_published ? "#16A34A" : "#999",
                                }}>
                                    {q.is_published ? <><Eye size={14} /> Published</> : <><EyeOff size={14} /> Draft</>}
                                </button>
                                <button onClick={() => deleteQuiz(q.id)} style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    border: "1px solid #E5E0DB", background: "white",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#999",
                                }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
