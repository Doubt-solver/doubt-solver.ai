"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Calendar, Loader2 } from "lucide-react";

interface PotDEntry {
    id: string;
    scheduled_date: string;
    question_text: string;
    subject: string;
}

export default function PotDPage() {
    const [entries, setEntries] = useState<PotDEntry[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [question, setQuestion] = useState("");
    const [subject, setSubject] = useState("Mathematics");
    const [saving, setSaving] = useState(false);

    // Load PotD entries from API on mount
    useEffect(() => {
        fetch("/api/admin/potd?list=true")
            .then((r) => r.json())
            .then((d) => {
                if (d.entries) setEntries(d.entries.map((e: Record<string, unknown>) => ({
                    id: e.id as string,
                    scheduled_date: e.scheduled_date as string,
                    question_text: (e.custom_question as Record<string, unknown>)?.question_text as string ?? (e.question_bank as Record<string, unknown>)?.question_text as string ?? "",
                    subject: (e.custom_question as Record<string, unknown>)?.subject as string ?? (e.question_bank as Record<string, unknown>)?.subject as string ?? "General",
                })));
            })
            .catch(() => { });
    }, []);

    const handleCreate = async () => {
        if (!question.trim() || !date) return;
        setSaving(true);
        try {
            await fetch("/api/admin/potd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scheduled_date: date,
                    custom_question: { question_text: question.trim(), subject },
                }),
            });
        } catch { }
        setEntries((prev) => [{
            id: Date.now().toString(),
            scheduled_date: date,
            question_text: question.trim(),
            subject,
        }, ...prev]);
        setQuestion("");
        setShowForm(false);
        setSaving(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>⭐ Problem of the Day</h1>
                    <p style={{ fontSize: 14, color: "#999" }}>Schedule daily featured problems for students</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", borderRadius: 12, background: "#1A1A1A", color: "white",
                    border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                }}>
                    <Plus size={16} /> Schedule Problem
                </button>
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                        padding: 24, borderRadius: 16,
                        background: "white", border: "1px solid #EDE8E3",
                        marginBottom: 24,
                    }}
                >
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Schedule a Problem</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{
                                width: "100%", padding: "10px 14px", borderRadius: 10,
                                border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit", background: "#FAFAF8",
                            }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Subject</label>
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{
                                width: "100%", padding: "10px 14px", borderRadius: 10,
                                border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit", background: "#FAFAF8",
                            }}>
                                {["Mathematics", "Science", "English", "Social Science", "Computer Science"].map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Question</label>
                        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Write the problem..." rows={3} style={{
                            width: "100%", padding: "12px 14px", borderRadius: 10,
                            border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit", background: "#FAFAF8", resize: "vertical",
                        }} />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleCreate} disabled={saving} style={{
                            padding: "10px 24px", borderRadius: 10, background: "#1A1A1A", color: "white",
                            border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                        }}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : "Schedule"}
                        </button>
                        <button onClick={() => setShowForm(false)} style={{
                            padding: "10px 24px", borderRadius: 10, background: "white", color: "#666",
                            border: "1px solid #E5E0DB", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                        }}>Cancel</button>
                    </div>
                </motion.div>
            )}

            {entries.length === 0 ? (
                <div style={{ padding: 48, borderRadius: 16, background: "white", border: "1px solid #EDE8E3", textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No problems scheduled</div>
                    <p style={{ fontSize: 14, color: "#999" }}>Schedule your first Problem of the Day.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {entries.sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date)).map((e) => (
                        <div key={e.id} style={{
                            padding: 18, borderRadius: 14,
                            background: "white", border: "1px solid #EDE8E3",
                            display: "flex", alignItems: "flex-start", gap: 16,
                        }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: "#FEF3E2", display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <div style={{ fontSize: 16, fontWeight: 800 }}>{new Date(e.scheduled_date).getDate()}</div>
                                <div style={{ fontSize: 9, fontWeight: 600, color: "#D97706" }}>
                                    {new Date(e.scheduled_date).toLocaleString("en", { month: "short" })}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, lineHeight: 1.5 }}>{e.question_text}</div>
                                <span style={{ padding: "2px 10px", borderRadius: 999, background: "#EFF6FF", color: "#2563EB", fontSize: 11, fontWeight: 600 }}>{e.subject}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
