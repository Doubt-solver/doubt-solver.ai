"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";

interface Question {
    id: string;
    subject: string;
    topic: string;
    difficulty: string;
    question_text: string;
    options: string[];
    correct_index: number;
    explanation: string;
    is_active: boolean;
}

const SUBJECTS = ["Mathematics", "Science", "English", "Social Science", "Computer Science"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const emptyForm = {
    subject: "Mathematics",
    topic: "",
    difficulty: "Medium",
    question_text: "",
    options: ["", "", "", ""],
    correct_index: 0,
    explanation: "",
};

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [filterSubject, setFilterSubject] = useState("All");

    // Load questions from API on mount
    useEffect(() => {
        fetch("/api/admin/questions")
            .then((r) => r.json())
            .then((d) => { if (d.questions) setQuestions(d.questions); })
            .catch(() => { });
    }, []);

    const handleSave = async () => {
        if (!form.question_text.trim() || !form.topic.trim() || form.options.some((o) => !o.trim())) return;
        setSaving(true);

        try {
            const res = await fetch("/api/admin/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.question) {
                setQuestions((prev) => [data.question, ...prev]);
            } else {
                // Optimistic add for mock
                setQuestions((prev) => [{
                    id: Date.now().toString(),
                    ...form,
                    is_active: true,
                }, ...prev]);
            }
            setForm({ ...emptyForm });
            setShowForm(false);
        } catch {
            // still add locally
            setQuestions((prev) => [{
                id: Date.now().toString(),
                ...form,
                is_active: true,
            }, ...prev]);
            setForm({ ...emptyForm });
            setShowForm(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        try {
            await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
        } catch { }
    };

    const filtered = questions.filter((q) => {
        if (filterSubject !== "All" && q.subject !== filterSubject) return false;
        if (search && !q.question_text.toLowerCase().includes(search.toLowerCase()) &&
            !q.topic.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Question Bank</h1>
                    <p style={{ fontSize: 14, color: "#999" }}>{questions.length} questions total</p>
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
                    <Plus size={16} /> Add Question
                </button>
            </div>

            {/* Add Question Form */}
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
                        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>New Question</h3>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Subject</label>
                                <select
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: 10,
                                        border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                                        background: "#FAFAF8",
                                    }}
                                >
                                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Topic</label>
                                <input
                                    value={form.topic}
                                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                                    placeholder="e.g. Quadratic Equations"
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: 10,
                                        border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                                        background: "#FAFAF8",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Difficulty</label>
                                <select
                                    value={form.difficulty}
                                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: 10,
                                        border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                                        background: "#FAFAF8",
                                    }}
                                >
                                    {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Question Text</label>
                            <textarea
                                value={form.question_text}
                                onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                                placeholder="Write or paste the question here..."
                                rows={3}
                                style={{
                                    width: "100%", padding: "12px 14px", borderRadius: 10,
                                    border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                                    background: "#FAFAF8", resize: "vertical",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Options (mark correct one)</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {form.options.map((opt, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <button
                                            onClick={() => setForm({ ...form, correct_index: i })}
                                            style={{
                                                width: 28, height: 28, borderRadius: "50%",
                                                border: form.correct_index === i ? "none" : "2px solid #E5E0DB",
                                                background: form.correct_index === i ? "#22C55E" : "white",
                                                color: "white", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {form.correct_index === i && <Check size={14} />}
                                        </button>
                                        <input
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...form.options];
                                                newOpts[i] = e.target.value;
                                                setForm({ ...form, options: newOpts });
                                            }}
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            style={{
                                                flex: 1, padding: "10px 14px", borderRadius: 10,
                                                border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                                                background: "#FAFAF8",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Explanation (optional)</label>
                            <textarea
                                value={form.explanation}
                                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                                placeholder="Explain why this is the correct answer..."
                                rows={2}
                                style={{
                                    width: "100%", padding: "12px 14px", borderRadius: 10,
                                    border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                                    background: "#FAFAF8", resize: "vertical",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: "10px 24px", borderRadius: 10,
                                    background: "#1A1A1A", color: "white",
                                    border: "none", fontWeight: 700, fontSize: 14,
                                    cursor: "pointer", fontFamily: "inherit",
                                    opacity: saving ? 0.6 : 1,
                                }}
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Question"}
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setForm({ ...emptyForm }); }}
                                style={{
                                    padding: "10px 24px", borderRadius: 10,
                                    background: "white", color: "#666",
                                    border: "1px solid #E5E0DB", fontWeight: 600, fontSize: 14,
                                    cursor: "pointer", fontFamily: "inherit",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={16} style={{ position: "absolute", left: 14, top: 12, color: "#999" }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search questions..."
                        style={{
                            width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10,
                            border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                            background: "white",
                        }}
                    />
                </div>
                <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    style={{
                        padding: "10px 16px", borderRadius: 10,
                        border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit",
                        background: "white",
                    }}
                >
                    <option>All</option>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* Questions List */}
            {filtered.length === 0 ? (
                <div style={{
                    padding: 48, borderRadius: 16,
                    background: "white", border: "1px solid #EDE8E3",
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No questions yet</div>
                    <p style={{ fontSize: 14, color: "#999" }}>
                        Click "Add Question" to create your first question.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map((q, i) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            style={{
                                padding: 18, borderRadius: 14,
                                background: "white", border: "1px solid #EDE8E3",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, lineHeight: 1.5 }}>
                                        {q.question_text}
                                    </div>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: 999,
                                            background: "#EFF6FF", color: "#2563EB",
                                            fontSize: 11, fontWeight: 600,
                                        }}>{q.subject}</span>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: 999,
                                            background: "#F5F0EC", color: "#666",
                                            fontSize: 11, fontWeight: 600,
                                        }}>{q.topic}</span>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: 999,
                                            background: q.difficulty === "Hard" ? "#FEF2F2" : q.difficulty === "Easy" ? "#F0FDF4" : "#FEF3E2",
                                            color: q.difficulty === "Hard" ? "#DC2626" : q.difficulty === "Easy" ? "#16A34A" : "#D97706",
                                            fontSize: 11, fontWeight: 600,
                                        }}>{q.difficulty}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            border: "1px solid #E5E0DB", background: "white",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: "pointer", color: "#999",
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
