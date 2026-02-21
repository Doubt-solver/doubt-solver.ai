"use client";

import { motion } from "framer-motion";

const weeklyData = [
    { day: "Mon", xp: 120 },
    { day: "Tue", xp: 85 },
    { day: "Wed", xp: 150 },
    { day: "Thu", xp: 60 },
    { day: "Fri", xp: 200 },
    { day: "Sat", xp: 175 },
    { day: "Sun", xp: 90 },
];

const subjectScores = [
    { name: "Mathematics", avg: 78, exams: 12, color: "#1CB0F6" },
    { name: "Science", avg: 65, exams: 8, color: "#58CC02" },
    { name: "English", avg: 85, exams: 10, color: "#CE82FF" },
    { name: "Social Science", avg: 55, exams: 5, color: "#FF9600" },
    { name: "Computer Science", avg: 92, exams: 6, color: "#FF4B4B" },
];

const weakTopics = [
    { topic: "Trigonometry", subject: "Mathematics", score: 42 },
    { topic: "Chemical Reactions", subject: "Science", score: 48 },
    { topic: "Indian National Movement", subject: "Social Science", score: 35 },
    { topic: "Heredity & Evolution", subject: "Science", score: 40 },
];

const strongTopics = [
    { topic: "Polynomials", subject: "Mathematics", score: 95 },
    { topic: "HTML & CSS", subject: "Computer Science", score: 98 },
    { topic: "Grammar — Tenses", subject: "English", score: 92 },
    { topic: "Networking", subject: "Computer Science", score: 90 },
];

const maxXP = Math.max(...weeklyData.map((d) => d.xp));

export default function AnalyticsPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>📊 Analytics</h1>
                <p>Track your progress and find areas to improve</p>
            </div>

            {/* Overview Stats */}
            <div className="stats-grid mt-6">
                <div className="stat-card">
                    <div className="stat-card-value text-green">41</div>
                    <div className="stat-card-label">Exams Taken</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value text-blue">75%</div>
                    <div className="stat-card-label">Avg Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value text-orange">880</div>
                    <div className="stat-card-label">XP This Week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value text-purple">4.2h</div>
                    <div className="stat-card-label">Study Time</div>
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
                    {weeklyData.map((d, i) => (
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
                                    background:
                                        "linear-gradient(180deg, var(--primary-green), var(--primary-green-dark))",
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
            <div className="mt-8">
                <h2 className="section-title mb-4">Subject Performance</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {subjectScores.map((sub, i) => (
                        <motion.div
                            key={i}
                            className="card"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                padding: 16,
                            }}
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
                                        style={{ background: sub.color }}
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
                                    color:
                                        sub.avg >= 80
                                            ? "var(--primary-green)"
                                            : sub.avg >= 60
                                                ? "var(--primary-orange)"
                                                : "var(--primary-red)",
                                }}
                            >
                                {sub.avg}%
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Weak & Strong Topics */}
            <div className="mt-8" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                    <h2 className="section-title mb-4">⚠️ Needs Improvement</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {weakTopics.map((t, i) => (
                            <div key={i} className="card" style={{ padding: 14 }}>
                                <div className="font-bold">{t.topic}</div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-muted">{t.subject}</span>
                                    <span className="font-bold text-red">{t.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="section-title mb-4">💪 Strong Topics</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {strongTopics.map((t, i) => (
                            <div key={i} className="card" style={{ padding: 14 }}>
                                <div className="font-bold">{t.topic}</div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-muted">{t.subject}</span>
                                    <span className="font-bold text-green">{t.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Recommendation */}
            <motion.div
                className="card mt-8 mb-6"
                style={{
                    background: "linear-gradient(135deg, rgba(88, 204, 2, 0.08), rgba(28, 176, 246, 0.08))",
                    borderColor: "rgba(88, 204, 2, 0.2)",
                    padding: 24,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="font-extrabold" style={{ fontSize: 18, marginBottom: 8 }}>
                    🤖 AI Recommendation
                </h3>
                <p className="text-muted" style={{ fontSize: 15, lineHeight: 1.7 }}>
                    Based on your recent performance, you should focus on{" "}
                    <strong className="text-red">Trigonometry</strong> and{" "}
                    <strong className="text-red">Chemical Reactions</strong>. Your scores in these topics
                    are below 50%. Try taking 2-3 practice exams this week on each topic. You&apos;re doing
                    great in <strong className="text-green">HTML & CSS</strong> and{" "}
                    <strong className="text-green">Polynomials</strong> — keep it up! 🎉
                </p>
            </motion.div>
        </motion.div>
    );
}
