"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Bookmark, CheckCircle2, StickyNote, Trash2, Filter } from "lucide-react";

interface RevisionItem {
    id: string;
    question_data: {
        question: string;
        subject?: string;
        topic?: string;
        options?: string[];
        correct_index?: number;
    };
    source: string;
    notes: string;
    is_mastered: boolean;
    created_at: string;
}

export default function RevisionsPage() {
    const [items, setItems] = useState<RevisionItem[]>([]);
    const [filter, setFilter] = useState<"all" | "active" | "mastered">("all");
    const [editingNotes, setEditingNotes] = useState<string | null>(null);

    // Load revisions from API on mount
    useEffect(() => {
        fetch("/api/student/revisions")
            .then((r) => r.json())
            .then((d) => { if (d.revisions) setItems(d.revisions); })
            .catch(() => { });
    }, []);

    const toggleMastered = async (id: string) => {
        const item = items.find((i) => i.id === id);
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, is_mastered: !item.is_mastered } : item
            )
        );
        try {
            await fetch("/api/student/revisions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, is_mastered: !item?.is_mastered }),
            });
        } catch { }
    };

    const updateNotes = async (id: string, notes: string) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, notes } : item))
        );
        try {
            await fetch("/api/student/revisions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, notes }),
            });
        } catch { }
    };

    const deleteItem = async (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        try {
            await fetch(`/api/student/revisions?id=${id}`, { method: "DELETE" });
        } catch { }
    };

    const filtered = items.filter((item) => {
        if (filter === "active") return !item.is_mastered;
        if (filter === "mastered") return item.is_mastered;
        return true;
    });

    // Group by subject
    const grouped: Record<string, RevisionItem[]> = {};
    for (const item of filtered) {
        const subject = item.question_data.subject ?? "General";
        if (!grouped[subject]) grouped[subject] = [];
        grouped[subject].push(item);
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Bookmark size={22} color="#F59E0B" />
                    <h1 style={{ fontSize: 24, fontWeight: 800 }}>Revision List</h1>
                </div>
                <p style={{ fontSize: 14, color: "#999" }}>
                    Questions you&apos;ve bookmarked to revisit later
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {(["all", "active", "mastered"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: "6px 16px", borderRadius: 999,
                            border: "none",
                            background: filter === f ? "#1A1A1A" : "#F5F0EC",
                            color: filter === f ? "white" : "#666",
                            fontSize: 13, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit",
                            textTransform: "capitalize",
                        }}
                    >
                        {f === "all" ? `All (${items.length})` : f === "active" ? `Active (${items.filter((i) => !i.is_mastered).length})` : `Mastered (${items.filter((i) => i.is_mastered).length})`}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{
                    padding: 48, borderRadius: 16,
                    background: "white", border: "1px solid #EDE8E3",
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                        {filter === "all" ? "No revisions yet" : `No ${filter} items`}
                    </div>
                    <p style={{ fontSize: 14, color: "#999" }}>
                        {filter === "all"
                            ? "Bookmark questions during exams to add them to your revision list."
                            : "Try a different filter."}
                    </p>
                </div>
            ) : (
                Object.entries(grouped).map(([subject, subjectItems]) => (
                    <div key={subject} style={{ marginBottom: 24 }}>
                        <div style={{
                            fontWeight: 700, fontSize: 14, color: "#999",
                            marginBottom: 10, textTransform: "uppercase", letterSpacing: 1,
                        }}>
                            {subject} ({subjectItems.length})
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {subjectItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    style={{
                                        padding: 18, borderRadius: 14,
                                        background: "white",
                                        border: `1px solid ${item.is_mastered ? "#BBF7D0" : "#EDE8E3"}`,
                                        opacity: item.is_mastered ? 0.7 : 1,
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: 600, fontSize: 15, lineHeight: 1.6, marginBottom: 8,
                                                textDecoration: item.is_mastered ? "line-through" : "none",
                                                color: item.is_mastered ? "#999" : "#1A1A1A",
                                            }}>
                                                {item.question_data.question}
                                            </div>
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                                                {item.question_data.topic && (
                                                    <span style={{
                                                        padding: "2px 10px", borderRadius: 999,
                                                        background: "#F5F0EC", color: "#666",
                                                        fontSize: 11, fontWeight: 600,
                                                    }}>{item.question_data.topic}</span>
                                                )}
                                                <span style={{
                                                    padding: "2px 10px", borderRadius: 999,
                                                    background: "#FEF3E2", color: "#D97706",
                                                    fontSize: 11, fontWeight: 600,
                                                }}>from {item.source}</span>
                                            </div>

                                            {/* Notes */}
                                            {editingNotes === item.id ? (
                                                <div style={{ marginTop: 8 }}>
                                                    <textarea
                                                        defaultValue={item.notes}
                                                        onBlur={(e) => {
                                                            updateNotes(item.id, e.target.value);
                                                            setEditingNotes(null);
                                                        }}
                                                        autoFocus
                                                        rows={2}
                                                        placeholder="Add your notes..."
                                                        style={{
                                                            width: "100%", padding: "8px 12px", borderRadius: 8,
                                                            border: "1px solid #E5E0DB", fontSize: 13, fontFamily: "inherit",
                                                            background: "#FAFAF8", resize: "vertical",
                                                        }}
                                                    />
                                                </div>
                                            ) : item.notes ? (
                                                <div
                                                    onClick={() => setEditingNotes(item.id)}
                                                    style={{
                                                        marginTop: 8, padding: "8px 12px", borderRadius: 8,
                                                        background: "#FAFAF8", fontSize: 13, color: "#666",
                                                        cursor: "pointer", lineHeight: 1.5,
                                                    }}
                                                >
                                                    <StickyNote size={12} style={{ display: "inline", marginRight: 6 }} />
                                                    {item.notes}
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            <button
                                                onClick={() => toggleMastered(item.id)}
                                                title={item.is_mastered ? "Unmark mastered" : "Mark as mastered"}
                                                style={{
                                                    width: 32, height: 32, borderRadius: 8,
                                                    border: "1px solid #E5E0DB", background: item.is_mastered ? "#22C55E" : "white",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer", color: item.is_mastered ? "white" : "#999",
                                                }}
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => setEditingNotes(item.id)}
                                                title="Add notes"
                                                style={{
                                                    width: 32, height: 32, borderRadius: 8,
                                                    border: "1px solid #E5E0DB", background: "white",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer", color: "#999",
                                                }}
                                            >
                                                <StickyNote size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                title="Remove"
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
                    </div>
                ))
            )}
        </motion.div>
    );
}
