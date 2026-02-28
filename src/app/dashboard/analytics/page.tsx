"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AnalyticsData {
    stats: { xp: number; level: number; streak: number; examCount: number; avgScore: number };
    weeklyXP: Array<{ day: string; xp: number }>;
    subjectProgress: Array<{ name: string; avg: number; exams: number }>;
    recentExams: Array<{ subject: string; topic: string; score: number; total: number; created_at: string }>;
}

const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: "#2563EB",
    Science: "#16A34A",
    English: "#7C3AED",
    "Social Science": "#D97706",
    "Computer Science": "#DC2626",
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/data?section=analytics")
            .then((r) => r.json())
            .then((d) => setData(d))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary-green)" }} />
            </div>
        );
    }

    const stats = data?.stats ?? { xp: 0, level: 1, streak: 0, examCount: 0, avgScore: 0 };
    const weeklyXP = data?.weeklyXP ?? [];
    const subjectProgress = data?.subjectProgress ?? [];
    const recentExams = data?.recentExams ?? [];

    const weeklyTotal = weeklyXP.reduce((s, d) => s + d.xp, 0);
    const maxXP = Math.max(...weeklyXP.map((d) => d.xp), 1);

    // Calculate weak and strong topics from recent exams
    const topicScores: Record<string, { subject: string; total: number; score: number }> = {};
    for (const e of recentExams) {
        const key = e.topic || "General";
        if (!topicScores[key]) topicScores[key] = { subject: e.subject, total: 0, score: 0 };
        topicScores[key].total += e.total;
        topicScores[key].score += e.score;
    }
    const topicList = Object.entries(topicScores)
        .map(([topic, s]) => ({ topic, subject: s.subject, pct: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0 }))
        .sort((a, b) => a.pct - b.pct);

    const weakTopics = topicList.filter((t) => t.pct < 60).slice(0, 4);
    const strongTopics = topicList.filter((t) => t.pct >= 75).sort((a, b) => b.pct - a.pct).slice(0, 4);

    const isEmpty = stats.examCount === 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>📊 Analytics</h1>
                <p>Track your progress and find areas to improve</p>
            </div>

            {isEmpty ? (
                <div className="card mt-8" style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                    <h2 className="font-extrabold" style={{ fontSize: 22, marginBottom: 8 }}>No data yet</h2>
                    <p className="text-muted" style={{ marginBottom: 24 }}>
                        Take your first exam to see your analytics here!
                    </p>
                    <Link href="/dashboard/exam" className="btn btn-primary" style={{ display: "inline-flex" }}>
                        Start Exam
                    </Link>
                </div>
            ) : (
                <>
                    {/* Overview Stats */}
                    <div className="stats-grid mt-6">
                        <div className="stat-card">
                            <div className="stat-card-value text-green">{stats.examCount}</div>
                            <div className="stat-card-label">Exams Taken</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value text-blue">{stats.avgScore}%</div>
                            <div className="stat-card-label">Avg Score</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value text-orange">{weeklyTotal}</div>
                            <div className="stat-card-label">XP This Week</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value text-purple">Lv.{stats.level}</div>
                            <div className="stat-card-label">Level</div>
                        </div>
                    </div>

                    {/* Weekly XP Chart */}
                    <div className="mt-8">
                        <h2 className="section-title mb-4">Weekly XP</h2>
                        <div
                            className="card"
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                gap: 12,
                                padding: 28,
                                height: 220,
                            }}
                        >
                            {weeklyXP.map((d, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <span className="text-sm font-bold text-green">{d.xp}</span>
                                    <motion.div
                                        style={{
                                            width: "100%",
                                            borderRadius: "var(--radius-sm)",
                                            background: "linear-gradient(180deg, var(--primary-green), var(--primary-green-dark))",
                                            minHeight: 4,
                                        }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.xp / maxXP) * 120}px` }}
                                        transition={{ duration: 0.6, delay: i * 0.08 }}
                                    />
                                    <span className="text-sm text-muted font-bold">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subject-wise Performance */}
                    {subjectProgress.length > 0 && (
                        <div className="mt-8">
                            <h2 className="section-title mb-4">Subject Performance</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {subjectProgress.map((sub, i) => (
                                    <motion.div
                                        key={i}
                                        className="card"
                                        style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div className="font-bold">{sub.name}</div>
                                            <div className="text-sm text-muted">{sub.exams} exams taken</div>
                                        </div>
                                        <div style={{ width: 200 }}>
                                            <div className="xp-bar-container" style={{ height: 10 }}>
                                                <motion.div
                                                    className="xp-bar-fill"
                                                    style={{ background: SUBJECT_COLORS[sub.name] ?? "#888" }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${sub.avg}%` }}
                                                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className="font-extrabold"
                                            style={{
                                                width: 48,
                                                textAlign: "right",
                                                color: sub.avg >= 80 ? "var(--primary-green)" : sub.avg >= 60 ? "var(--primary-orange)" : "var(--primary-red)",
                                            }}
                                        >
                                            {sub.avg}%
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Weak & Strong Topics */}
                    {(weakTopics.length > 0 || strongTopics.length > 0) && (
                        <div className="mt-8" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <h2 className="section-title mb-4">⚠️ Needs Improvement</h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {weakTopics.length === 0 ? (
                                        <div className="card" style={{ padding: 20, textAlign: "center" }}>
                                            <p className="text-muted">All topics looking good! 🎉</p>
                                        </div>
                                    ) : (
                                        weakTopics.map((t, i) => (
                                            <div key={i} className="card" style={{ padding: 14 }}>
                                                <div className="font-bold">{t.topic}</div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-sm text-muted">{t.subject}</span>
                                                    <span className="font-bold text-red">{t.pct}%</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="section-title mb-4">💪 Strong Topics</h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {strongTopics.length === 0 ? (
                                        <div className="card" style={{ padding: 20, textAlign: "center" }}>
                                            <p className="text-muted">Keep practicing to build strengths!</p>
                                        </div>
                                    ) : (
                                        strongTopics.map((t, i) => (
                                            <div key={i} className="card" style={{ padding: 14 }}>
                                                <div className="font-bold">{t.topic}</div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-sm text-muted">{t.subject}</span>
                                                    <span className="font-bold text-green">{t.pct}%</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}
