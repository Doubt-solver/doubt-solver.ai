"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Eye, Loader2 } from "lucide-react";

interface Report {
    id: string;
    reason: string;
    status: string;
    question_data: { question?: string;[key: string]: unknown };
    admin_notes: string;
    created_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    open: { bg: "#FEF2F2", color: "#DC2626", label: "Open" },
    reviewed: { bg: "#FEF3E2", color: "#D97706", label: "Reviewed" },
    resolved: { bg: "#F0FDF4", color: "#16A34A", label: "Resolved" },
    dismissed: { bg: "#F5F0EC", color: "#666", label: "Dismissed" },
};

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/reports")
            .then((r) => r.json())
            .then((d) => setReports(d.reports ?? []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        setReports((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        try {
            await fetch("/api/admin/reports", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });
        } catch { }
    };

    const filtered = reports.filter((r) => filter === "all" || r.status === filter);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "#999" }} />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Student Reports</h1>
                <p style={{ fontSize: 14, color: "#999" }}>Review and address issues reported by students</p>
            </div>

            {/* Status Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {["all", "open", "reviewed", "resolved", "dismissed"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{
                            padding: "6px 16px", borderRadius: 999,
                            border: "none",
                            background: filter === s ? "#1A1A1A" : "#F5F0EC",
                            color: filter === s ? "white" : "#666",
                            fontSize: 13, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit",
                        }}
                    >
                        {s === "all" ? "All" : STATUS_STYLES[s]?.label ?? s}
                        {s !== "all" && ` (${reports.filter((r) => r.status === s).length})`}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{ padding: 48, borderRadius: 16, background: "white", border: "1px solid #EDE8E3", textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                        {filter === "all" ? "No reports yet" : `No ${filter} reports`}
                    </div>
                    <p style={{ fontSize: 14, color: "#999" }}>
                        {filter === "all" ? "All clear! No issues reported by students." : "Try a different filter."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map((r) => {
                        const style = STATUS_STYLES[r.status] ?? STATUS_STYLES.open;
                        const isExpanded = expandedId === r.id;

                        return (
                            <motion.div key={r.id} layout style={{
                                padding: 18, borderRadius: 14,
                                background: "white", border: "1px solid #EDE8E3",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{r.reason}</div>
                                        <div style={{ fontSize: 12, color: "#999" }}>
                                            {new Date(r.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{
                                            padding: "4px 12px", borderRadius: 999,
                                            background: style.bg, color: style.color,
                                            fontSize: 11, fontWeight: 700,
                                        }}>{style.label}</span>
                                        <button onClick={() => setExpandedId(isExpanded ? null : r.id)} style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            border: "1px solid #E5E0DB", background: "white",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: "pointer", color: "#999",
                                        }}>
                                            <Eye size={14} />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #EDE8E3" }}>
                                        {r.question_data?.question && (
                                            <div style={{
                                                padding: 14, borderRadius: 10,
                                                background: "#FAFAF8", marginBottom: 16,
                                                fontSize: 14, lineHeight: 1.6,
                                            }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>Reported Question:</div>
                                                {r.question_data.question}
                                            </div>
                                        )}
                                        <div style={{ display: "flex", gap: 8 }}>
                                            {r.status === "open" && (
                                                <button onClick={() => updateStatus(r.id, "reviewed")} style={{
                                                    display: "flex", alignItems: "center", gap: 4,
                                                    padding: "6px 16px", borderRadius: 8, border: "none",
                                                    background: "#FEF3E2", color: "#D97706",
                                                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                                }}>
                                                    <Eye size={14} /> Mark Reviewed
                                                </button>
                                            )}
                                            {(r.status === "open" || r.status === "reviewed") && (
                                                <>
                                                    <button onClick={() => updateStatus(r.id, "resolved")} style={{
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        padding: "6px 16px", borderRadius: 8, border: "none",
                                                        background: "#F0FDF4", color: "#16A34A",
                                                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                                    }}>
                                                        <CheckCircle2 size={14} /> Resolve
                                                    </button>
                                                    <button onClick={() => updateStatus(r.id, "dismissed")} style={{
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        padding: "6px 16px", borderRadius: 8, border: "none",
                                                        background: "#F5F0EC", color: "#666",
                                                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                                    }}>
                                                        <XCircle size={14} /> Dismiss
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
