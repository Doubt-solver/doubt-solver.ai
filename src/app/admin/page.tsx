"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    BookOpen,
    ClipboardList,
    AlertTriangle,
    Users,
    Megaphone,
    Loader2,
} from "lucide-react";
import Link from "next/link";

interface AdminStats {
    totalQuestions: number;
    totalQuizzes: number;
    openReports: number;
    totalStudents: number;
    recentReports: Array<{ id: string; reason: string; status: string; created_at: string }>;
    recentAnnouncements: Array<{ id: string; title: string; created_at: string }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then((r) => r.json())
            .then((d) => setStats(d))
            .catch(() =>
                setStats({
                    totalQuestions: 0,
                    totalQuizzes: 0,
                    openReports: 0,
                    totalStudents: 0,
                    recentReports: [],
                    recentAnnouncements: [],
                })
            )
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "#999" }} />
            </div>
        );
    }

    const cards = [
        { label: "Questions", value: stats?.totalQuestions ?? 0, icon: <BookOpen size={20} />, color: "#2563EB", bg: "#EFF6FF", href: "/admin/questions" },
        { label: "Quizzes", value: stats?.totalQuizzes ?? 0, icon: <ClipboardList size={20} />, color: "#7C3AED", bg: "#F5F3FF", href: "/admin/quizzes" },
        { label: "Open Reports", value: stats?.openReports ?? 0, icon: <AlertTriangle size={20} />, color: "#DC2626", bg: "#FEF2F2", href: "/admin/reports" },
        { label: "Students", value: stats?.totalStudents ?? 0, icon: <Users size={20} />, color: "#16A34A", bg: "#F0FDF4", href: "/admin" },
    ];

    const fadeUp = {
        hidden: { opacity: 0, y: 16 },
        visible: (i: number) => ({
            opacity: 1, y: 0,
            transition: { delay: i * 0.08, duration: 0.4 },
        }),
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
                <p style={{ fontSize: 15, color: "#999" }}>Manage your content and monitor student activity</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                {cards.map((card, i) => (
                    <motion.div key={card.label} custom={i} variants={fadeUp} initial="hidden" animate="visible">
                        <Link
                            href={card.href}
                            style={{
                                display: "block",
                                padding: 20,
                                borderRadius: 16,
                                background: "white",
                                border: "1px solid #EDE8E3",
                                textDecoration: "none",
                                color: "inherit",
                                transition: "transform 150ms ease, box-shadow 150ms ease",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                            }}
                        >
                            <div style={{
                                width: 40, height: 40,
                                borderRadius: 10,
                                background: card.bg,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: card.color, marginBottom: 12,
                            }}>
                                {card.icon}
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800 }}>{card.value}</div>
                            <div style={{ fontSize: 13, color: "#999", fontWeight: 600, marginTop: 2 }}>{card.label}</div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Recent Reports */}
                <motion.div
                    custom={4} variants={fadeUp} initial="hidden" animate="visible"
                    style={{
                        padding: 24, borderRadius: 16,
                        background: "white", border: "1px solid #EDE8E3",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertTriangle size={16} color="#DC2626" />
                            <span style={{ fontWeight: 700, fontSize: 15 }}>Recent Reports</span>
                        </div>
                        <Link href="/admin/reports" style={{ fontSize: 13, color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
                            View all →
                        </Link>
                    </div>
                    {(stats?.recentReports ?? []).length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px 0", color: "#999", fontSize: 14 }}>
                            No reports yet — all clear! ✅
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {(stats?.recentReports ?? []).slice(0, 4).map((r) => (
                                <div key={r.id} style={{
                                    padding: 12, borderRadius: 10,
                                    background: "#FAFAF8", border: "1px solid #EDE8E3",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{r.reason}</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700,
                                        padding: "2px 10px", borderRadius: 999,
                                        background: r.status === "open" ? "#FEF2F2" : "#F0FDF4",
                                        color: r.status === "open" ? "#DC2626" : "#16A34A",
                                    }}>
                                        {r.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    custom={5} variants={fadeUp} initial="hidden" animate="visible"
                    style={{
                        padding: 24, borderRadius: 16,
                        background: "white", border: "1px solid #EDE8E3",
                    }}
                >
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Quick Actions</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            { label: "Add New Question", href: "/admin/questions", icon: <BookOpen size={16} />, color: "#2563EB" },
                            { label: "Create Quiz", href: "/admin/quizzes", icon: <ClipboardList size={16} />, color: "#7C3AED" },
                            { label: "Post Announcement", href: "/admin/announcements", icon: <Megaphone size={16} />, color: "#D97706" },
                            { label: "Set Problem of the Day", href: "/admin/potd", icon: <span style={{ fontSize: 14 }}>⭐</span>, color: "#F59E0B" },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "12px 16px", borderRadius: 12,
                                    background: "#FAFAF8", border: "1px solid #EDE8E3",
                                    textDecoration: "none", color: "#1A1A1A",
                                    fontWeight: 600, fontSize: 14,
                                    transition: "background 150ms ease",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F0EC"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFAF8"; }}
                            >
                                <span style={{ color: action.color }}>{action.icon}</span>
                                {action.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
