"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Pin, Trash2, Loader2 } from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    body: string;
    audience: string;
    is_pinned: boolean;
    created_at: string;
}

export default function AnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [audience, setAudience] = useState("all");
    const [isPinned, setIsPinned] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load announcements from API on mount
    useEffect(() => {
        fetch("/api/admin/announcements")
            .then((r) => r.json())
            .then((d) => { if (d.announcements) setItems(d.announcements); })
            .catch(() => { });
    }, []);

    const handleCreate = async () => {
        if (!title.trim() || !body.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), body: body.trim(), audience, is_pinned: isPinned }),
            });
            const data = await res.json();
            const newItem: Announcement = data.announcement ?? {
                id: Date.now().toString(),
                title: title.trim(), body: body.trim(), audience, is_pinned: isPinned,
                created_at: new Date().toISOString(),
            };
            setItems((prev) => [newItem, ...prev]);
        } catch {
            setItems((prev) => [{ id: Date.now().toString(), title: title.trim(), body: body.trim(), audience, is_pinned: isPinned, created_at: new Date().toISOString() }, ...prev]);
        }
        setTitle(""); setBody(""); setIsPinned(false);
        setShowForm(false);
        setSaving(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Announcements</h1>
                    <p style={{ fontSize: 14, color: "#999" }}>Post announcements for students</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", borderRadius: 12,
                    background: "#1A1A1A", color: "white",
                    border: "none", fontWeight: 700, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit",
                }}>
                    <Plus size={16} /> New Announcement
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
                        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>New Announcement</h3>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Title</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" style={{
                                width: "100%", padding: "10px 14px", borderRadius: 10,
                                border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit", background: "#FAFAF8",
                            }} />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Message</label>
                            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the announcement..." rows={4} style={{
                                width: "100%", padding: "12px 14px", borderRadius: 10,
                                border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit", background: "#FAFAF8", resize: "vertical",
                            }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Audience</label>
                                <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{
                                    width: "100%", padding: "10px 14px", borderRadius: 10,
                                    border: "1px solid #E5E0DB", fontSize: 14, fontFamily: "inherit", background: "#FAFAF8",
                                }}>
                                    <option value="all">All Students</option>
                                    <option value="class_9">Class 9</option>
                                    <option value="class_10">Class 10</option>
                                    <option value="class_11">Class 11</option>
                                    <option value="class_12">Class 12</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", alignItems: "end" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#666" }}>
                                    <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} style={{ width: 18, height: 18 }} />
                                    <Pin size={14} /> Pin to top
                                </label>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={handleCreate} disabled={saving} style={{
                                padding: "10px 24px", borderRadius: 10, background: "#1A1A1A", color: "white",
                                border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                            }}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : "Post Announcement"}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{
                                padding: "10px 24px", borderRadius: 10, background: "white", color: "#666",
                                border: "1px solid #E5E0DB", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                            }}>Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {items.length === 0 ? (
                <div style={{ padding: 48, borderRadius: 16, background: "white", border: "1px solid #EDE8E3", textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No announcements yet</div>
                    <p style={{ fontSize: 14, color: "#999" }}>Create your first announcement to notify students.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {items.map((a) => (
                        <div key={a.id} style={{
                            padding: 18, borderRadius: 14,
                            background: "white", border: `1px solid ${a.is_pinned ? "#D97706" : "#EDE8E3"}`,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                {a.is_pinned && <Pin size={14} color="#D97706" />}
                                <span style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</span>
                                <span style={{ padding: "2px 10px", borderRadius: 999, background: "#F5F0EC", color: "#666", fontSize: 11, fontWeight: 600 }}>
                                    {a.audience === "all" ? "All" : a.audience.replace("_", " ")}
                                </span>
                            </div>
                            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 8 }}>{a.body}</p>
                            <div style={{ fontSize: 12, color: "#999" }}>{new Date(a.created_at).toLocaleDateString()}</div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
