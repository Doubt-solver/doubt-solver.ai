"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
    BookOpen,
    Upload,
    Gift,
    FileQuestion,
    CheckCircle2,
    TrendingUp,
    BarChart3,
    ArrowRight,
    Loader2,
    X,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
    stats: { xp: number; level: number; streak: number; examCount: number; avgScore: number };
    recentExams: Array<{ subject: string; topic: string; score: number; total: number; created_at: string }>;
    subjectProgress: Array<{ name: string; avg: number; exams: number }>;
    leaderboard: Array<{ id: string; name: string; xp: number; grade: string }>;
    currentUserId: string;
}

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/data?section=dashboard")
            .then((r) => r.json())
            .then((d) => setData(d))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "#999" }} />
            </div>
        );
    }

    const stats = data?.stats ?? { xp: 0, level: 1, streak: 0, examCount: 0, avgScore: 0 };
    const todayIdx = new Date().getDay(); // 0=Sun
    const adjustedIdx = todayIdx === 0 ? 6 : todayIdx - 1; // M=0 ... S=6

    const fadeUp = {
        hidden: { opacity: 0, y: 16 },
        visible: (i: number) => ({
            opacity: 1, y: 0,
            transition: { delay: i * 0.08, duration: 0.4 },
        }),
    };

    return (
        <div>
            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 32 }}
            >
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
                    Welcome back! 👋
                </h1>
                <p style={{ fontSize: 16, color: "#999", marginTop: 4 }}>
                    Ready to learn something new today?
                </p>
            </motion.div>

            {/* Feature Cards Grid */}
            <motion.div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 16,
                    marginBottom: 24,
                }}
                initial="hidden" animate="visible"
            >
                {[
                    {
                        icon: <BookOpen size={22} />,
                        title: "Question Bank",
                        desc: "Practice expert-curated questions and view attempt history",
                        href: "/dashboard/subjects",
                        bg: "#FEF3E2",
                        color: "#D97706",
                    },
                    {
                        icon: <Upload size={22} />,
                        title: "Ask a Doubt",
                        desc: "Upload and solve single or multiple questions",
                        href: "/dashboard/doubts",
                        bg: "#F0F9FF",
                        color: "#2563EB",
                    },
                    {
                        icon: <Gift size={22} />,
                        title: "Question of the Day",
                        desc: "Unbox a hidden challenge tailored to you.",
                        href: "/dashboard/exam?subject=Mathematics&topic=Mixed",
                        bg: "#FFF1F2",
                        color: "#E11D48",
                    },
                    {
                        icon: <FileQuestion size={22} />,
                        title: "Mock Test",
                        desc: "Test & analyze",
                        href: "/dashboard/exam",
                        bg: "#F5F0EC",
                        color: "#1A1A1A",
                    },
                ].map((item, i) => (
                    <motion.div key={item.title} custom={i} variants={fadeUp}>
                        <Link
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                padding: 20,
                                borderRadius: 16,
                                background: item.bg,
                                textDecoration: "none",
                                color: "inherit",
                                transition: "transform 150ms ease, box-shadow 150ms ease",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                            }}
                        >
                            <div style={{
                                width: 44, height: 44,
                                borderRadius: 12,
                                background: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: item.color,
                                flexShrink: 0,
                            }}>
                                {item.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1A1A" }}>{item.title}</div>
                                <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>{item.desc}</div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* Streak & Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                {/* Streak Card — Fermi-style */}
                <motion.div
                    custom={4} variants={fadeUp} initial="hidden" animate="visible"
                    style={{
                        padding: "28px 24px 0",
                        borderRadius: 16,
                        background: "white",
                        border: "1px solid #EDE8E3",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Large Streak Circle */}
                    <div style={{
                        width: 110, height: 110,
                        borderRadius: "50%",
                        border: "5px solid #E5E0DB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 14px",
                        background: "#F9F7F5",
                    }}>
                        <span style={{ fontSize: 42, fontWeight: 800, color: "#22C55E" }}>
                            {stats.streak}
                        </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Days streak</div>
                    <div style={{ fontSize: 14, color: "#999", marginBottom: 20 }}>
                        {stats.streak > 0 ? "You are off to a great start!" : "Start a streak today!"}
                    </div>

                    {/* Weekly Calendar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
                        {/* Left arrow */}
                        <button style={{
                            width: 28, height: 28, borderRadius: "50%",
                            border: "none", background: "transparent",
                            color: "#999", cursor: "pointer", fontSize: 16,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            ‹
                        </button>

                        {weekDays.map((day, i) => {
                            const isToday = i === adjustedIdx;
                            const isActive = isToday && stats.streak > 0;
                            return (
                                <div key={i} style={{ textAlign: "center" }}>
                                    <div style={{
                                        width: 32, height: 32,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 6,
                                        background: isActive ? "#22C55E" : "#ECEAE6",
                                        transition: "all 200ms ease",
                                    }}>
                                        {isActive && <CheckCircle2 size={16} color="white" />}
                                    </div>
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: isToday ? 800 : 500,
                                        color: isToday ? "#1A1A1A" : "#999",
                                    }}>
                                        {day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Date Range */}
                    <div style={{ fontSize: 12, color: "#999", fontWeight: 500, marginBottom: 20 }}>
                        {(() => {
                            const now = new Date();
                            const dayOfWeek = now.getDay();
                            const monday = new Date(now);
                            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                            const sunday = new Date(monday);
                            sunday.setDate(monday.getDate() + 6);
                            const fmt = (d: Date) => d.getDate();
                            const monthYear = sunday.toLocaleString("en", { month: "short", year: "numeric" });
                            return `${fmt(monday)}-${fmt(sunday)} ${monthYear}`;
                        })()}
                    </div>

                    {/* Divider + Bottom Stats */}
                    <div style={{
                        borderTop: "1px solid #EDE8E3",
                        display: "flex",
                        marginLeft: -24,
                        marginRight: -24,
                    }}>
                        {/* Longest streak */}
                        <div style={{
                            flex: 1,
                            padding: "16px 0",
                            borderRight: "1px solid #EDE8E3",
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#1A1A1A" }}>
                                {stats.streak} days
                            </div>
                            <div style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>
                                Longest streak
                            </div>
                        </div>

                        {/* Streak Freeze */}
                        <div style={{
                            flex: 1,
                            padding: "16px 0",
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#1A1A1A" }}>
                                2 <span style={{ fontSize: 18 }}>❄️</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>
                                Streak Freeze<br />available
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Card */}
                <motion.div
                    custom={5} variants={fadeUp} initial="hidden" animate="visible"
                    style={{
                        padding: 24,
                        borderRadius: 16,
                        background: "white",
                        border: "1px solid #EDE8E3",
                    }}
                >
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Your Stats</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {[
                            { label: "Total XP", value: stats.xp, icon: <TrendingUp size={18} />, color: "#22C55E" },
                            { label: "Level", value: stats.level, icon: <BarChart3 size={18} />, color: "#2563EB" },
                            { label: "Exams Taken", value: stats.examCount, icon: <FileQuestion size={18} />, color: "#F59E0B" },
                            { label: "Avg Score", value: `${stats.avgScore}%`, icon: <CheckCircle2 size={18} />, color: "#8B5CF6" },
                        ].map((item) => (
                            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36,
                                    borderRadius: 10,
                                    background: `${item.color}10`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: item.color,
                                }}>
                                    {item.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: "#999", fontWeight: 600 }}>{item.label}</div>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 20 }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Study Group — Fermi-style */}
            <motion.div
                custom={5.5} variants={fadeUp} initial="hidden" animate="visible"
                style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "white",
                    border: "1px solid #EDE8E3",
                    marginBottom: 24,
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 20 }}>👥</span>
                            <span style={{ fontWeight: 800, fontSize: 18 }}>Study Group</span>
                        </div>
                        <div style={{ fontSize: 14, color: "#999" }}>Students solving with DoubtSolver</div>
                    </div>
                    <button
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 20px",
                            borderRadius: 12,
                            border: "1px solid #E5E0DB",
                            background: "white",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            color: "#1A1A1A",
                        }}
                    >
                        + Create New
                    </button>
                </div>

                <div style={{ display: "flex", gap: 20 }}>
                    {/* Left: Active Group */}
                    <div style={{ flex: 1 }}>
                        {/* Group Header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{
                                width: 36, height: 36,
                                borderRadius: 8,
                                background: "#F5F0EC",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 800,
                                fontStyle: "italic",
                                color: "#1A1A1A",
                            }}>
                                DS
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>DoubtSolver.ai</div>
                                <div style={{ fontSize: 13 }}>
                                    <span style={{ color: "#22C55E", fontWeight: 600 }}>20 students</span>
                                    <span style={{ color: "#999" }}> solving now</span>
                                </div>
                            </div>
                        </div>

                        {/* Question Cards */}
                        {[
                            {
                                question: "If HCF (16, y) = 8 and LCM (16, y) = 48, then the value of y is (a) 24...",
                                user: "prime-watt-1580",
                                color: "#F59E0B",
                            },
                            {
                                question: "For what value of k, the product of zeroes of the polynomial kx² − 4x − 7 is 2?...",
                                user: "prime-watt-1580",
                                color: "#F59E0B",
                            },
                        ].map((q, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: 16,
                                    borderRadius: 12,
                                    background: "#FAFAF8",
                                    border: "1px solid #EDE8E3",
                                    marginBottom: 10,
                                }}
                            >
                                <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, marginBottom: 12, color: "#1A1A1A" }}>
                                    {q.question}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{
                                            width: 24, height: 24,
                                            borderRadius: "50%",
                                            background: q.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: "white",
                                        }}>
                                            {q.user[0].toUpperCase()}
                                        </div>
                                        <span style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>{q.user}</span>
                                        <span style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            padding: "2px 10px",
                                            borderRadius: 999,
                                            background: "#FEF3E2",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: "#D97706",
                                        }}>
                                            👀 Your class
                                        </span>
                                    </div>
                                    <Link
                                        href="/dashboard/doubts"
                                        style={{
                                            padding: "6px 18px",
                                            borderRadius: 8,
                                            border: "1px solid #E5E0DB",
                                            background: "white",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "#1A1A1A",
                                            textDecoration: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Solve
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Join Card */}
                    <div style={{
                        width: 180,
                        flexShrink: 0,
                        borderRadius: 16,
                        border: "2px dashed #D5D0CB",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: 20,
                        cursor: "pointer",
                        textAlign: "center",
                    }}>
                        <span style={{ fontSize: 28, color: "#C5C0BB" }}>👥</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#999" }}>
                            Join a Study<br />Group
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Performance Trends — Fermi-style */}
            <PerformanceTrends
                recentExams={data?.recentExams ?? []}
                subjectProgress={data?.subjectProgress ?? []}
                examCount={stats.examCount}
                fadeUp={fadeUp}
            />

            {/* Bottom Actions */}
            <motion.div
                custom={7} variants={fadeUp} initial="hidden" animate="visible"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    marginTop: 8,
                    paddingBottom: 24,
                }}
            >
                <Link
                    href="/dashboard/doubts"
                    className="btn btn-outline"
                    style={{ borderRadius: 999, padding: "12px 24px", fontSize: 14 }}
                >
                    <Upload size={16} /> Upload question
                </Link>
                <Link
                    href="/dashboard/subjects"
                    className="btn btn-primary"
                    style={{ borderRadius: 999, padding: "12px 24px", fontSize: 14 }}
                >
                    Go to Question Bank <ArrowRight size={16} />
                </Link>
            </motion.div>
        </div>
    );
}

/* ─── Fermi-style Performance Trends component ─── */

const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: "#2563EB",
    Science: "#16A34A",
    English: "#7C3AED",
    "Social Science": "#D97706",
    "Computer Science": "#DC2626",
};

interface PTProps {
    recentExams: Array<{ subject: string; topic: string; score: number; total: number; created_at: string }>;
    subjectProgress: Array<{ name: string; avg: number; exams: number }>;
    examCount: number;
    fadeUp: Variants;
}

function PerformanceTrends({ recentExams, subjectProgress, examCount, fadeUp }: PTProps) {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
        () => {
            const subjects = [...new Set(recentExams.map(e => e.subject))];
            return subjects.length > 0 ? [subjects[0]] : [];
        }
    );

    const allSubjects = [...new Set(recentExams.map(e => e.subject))];

    const toggleSubject = (s: string) => {
        setSelectedSubjects(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    // Build chart data — group exams by date, filter by selected subjects
    const filteredExams = recentExams.filter(e =>
        selectedSubjects.length === 0 || selectedSubjects.includes(e.subject)
    );

    // Group by date and average score
    const dateMap: Record<string, { total: number; score: number; count: number }> = {};
    for (const e of filteredExams) {
        const d = e.created_at ? new Date(e.created_at).toISOString().slice(0, 10) : "unknown";
        if (!dateMap[d]) dateMap[d] = { total: 0, score: 0, count: 0 };
        dateMap[d].total += e.total;
        dateMap[d].score += e.score;
        dateMap[d].count++;
    }

    const chartPoints = Object.entries(dateMap)
        .map(([date, v]) => ({ date, pct: v.total > 0 ? Math.round((v.score / v.total) * 100) : 0 }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-8); // last 8 data points

    // Build strong/weak topics
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

    const weakTopics = topicList.filter(t => t.pct < 60).slice(0, 3);
    const strongTopics = topicList.filter(t => t.pct >= 75).sort((a, b) => b.pct - a.pct).slice(0, 3);

    // SVG chart dimensions
    const W = 700, H = 200, PAD_L = 48, PAD_R = 16, PAD_T = 16, PAD_B = 32;
    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_T - PAD_B;

    // Y-axis range
    const allPcts = chartPoints.map(p => p.pct);
    const minPct = allPcts.length > 0 ? Math.max(0, Math.floor((Math.min(...allPcts) - 5) / 10) * 10) : 0;
    const maxPct = allPcts.length > 0 ? Math.min(100, Math.ceil((Math.max(...allPcts) + 5) / 10) * 10) : 100;
    const yRange = maxPct - minPct || 10;

    const toX = (i: number) => PAD_L + (chartPoints.length > 1 ? (i / (chartPoints.length - 1)) * chartW : chartW / 2);
    const toY = (pct: number) => PAD_T + chartH - ((pct - minPct) / yRange) * chartH;

    const polyline = chartPoints.map((p, i) => `${toX(i)},${toY(p.pct)}`).join(" ");

    // Format date label
    const fmtDate = (d: string) => {
        try {
            const dt = new Date(d);
            return `${dt.getDate()} ${dt.toLocaleString("en", { month: "short" })}'${String(dt.getFullYear()).slice(2)}`;
        } catch {
            return d;
        }
    };

    // Y-axis tick count
    const yTicks: number[] = [];
    for (let v = minPct; v <= maxPct; v += 10) yTicks.push(v);

    return (
        <motion.div
            custom={6} variants={fadeUp} initial="hidden" animate="visible"
            style={{
                padding: 24,
                borderRadius: 16,
                background: "white",
                border: "1px solid #EDE8E3",
                marginBottom: 24,
            }}
        >
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Performance Trends</div>

            {examCount < 1 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <BarChart3 size={48} style={{ color: "#E5E0DB", marginBottom: 16 }} />
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No trends unlocked yet</div>
                    <p style={{ fontSize: 14, color: "#999" }}>
                        Solve questions to generate your first report.
                    </p>
                </div>
            ) : (
                <>
                    {/* Subject Chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                        {allSubjects.map(s => {
                            const active = selectedSubjects.includes(s);
                            const color = SUBJECT_COLORS[s] ?? "#1A1A1A";
                            return (
                                <button
                                    key={s}
                                    onClick={() => toggleSubject(s)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "6px 14px",
                                        borderRadius: 999,
                                        border: "none",
                                        background: active ? color : "#F5F0EC",
                                        color: active ? "white" : "#1A1A1A",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        transition: "all 150ms ease",
                                    }}
                                >
                                    {active && <X size={12} />}
                                    {s}
                                </button>
                            );
                        })}
                    </div>

                    {/* SVG Line Chart */}
                    {chartPoints.length > 0 ? (
                        <div style={{ overflowX: "auto", marginBottom: 20 }}>
                            <svg
                                viewBox={`0 0 ${W} ${H}`}
                                width="100%"
                                style={{ maxHeight: 240, display: "block" }}
                                preserveAspectRatio="xMidYMid meet"
                            >
                                {/* Grid lines */}
                                {yTicks.map(v => (
                                    <g key={v}>
                                        <line
                                            x1={PAD_L} x2={W - PAD_R}
                                            y1={toY(v)} y2={toY(v)}
                                            stroke="#EDE8E3"
                                            strokeDasharray="4 4"
                                        />
                                        <text
                                            x={PAD_L - 8}
                                            y={toY(v) + 4}
                                            textAnchor="end"
                                            fill="#999"
                                            fontSize={11}
                                            fontWeight={600}
                                        >
                                            {v}%
                                        </text>
                                    </g>
                                ))}

                                {/* Line */}
                                <polyline
                                    points={polyline}
                                    fill="none"
                                    stroke="#B0C4D8"
                                    strokeWidth={2}
                                    strokeLinejoin="round"
                                />

                                {/* Dots */}
                                {chartPoints.map((p, i) => (
                                    <circle
                                        key={i}
                                        cx={toX(i)}
                                        cy={toY(p.pct)}
                                        r={5}
                                        fill="#A3C4E0"
                                        stroke="white"
                                        strokeWidth={2}
                                    />
                                ))}

                                {/* X-axis labels */}
                                {chartPoints.map((p, i) => (
                                    <text
                                        key={i}
                                        x={toX(i)}
                                        y={H - 4}
                                        textAnchor="middle"
                                        fill="#999"
                                        fontSize={10}
                                        fontWeight={500}
                                    >
                                        {fmtDate(p.date)}
                                    </text>
                                ))}
                            </svg>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "24px 0", color: "#999", fontSize: 14 }}>
                            No chart data for selected subjects
                        </div>
                    )}

                    {/* Strong & Weak Areas */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {/* Strong Areas */}
                        <div style={{
                            padding: 20,
                            borderRadius: 12,
                            background: "#FAFAF8",
                            border: "1px solid #EDE8E3",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <CheckCircle2 size={16} color="#22C55E" />
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>Strong areas</span>
                                </div>
                                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#999", fontWeight: 600 }}>
                                    <span>Score %</span>
                                    <span>± from last week</span>
                                </div>
                            </div>

                            {strongTopics.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "16px 0", color: "#999", fontSize: 13 }}>
                                    No strong areas data available yet.
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {strongTopics.map((t, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.topic}</div>
                                                <div style={{ fontSize: 12, color: "#999" }}>{t.subject}</div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <span style={{ fontWeight: 700, fontSize: 14 }}>{t.pct}%</span>
                                                <span style={{ fontSize: 12, color: "#999" }}>0</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Weak Areas */}
                        <div style={{
                            padding: 20,
                            borderRadius: 12,
                            background: "#FAFAF8",
                            border: "1px solid #EDE8E3",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <AlertTriangle size={16} color="#EF4444" />
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>Weak areas</span>
                                </div>
                                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#999", fontWeight: 600 }}>
                                    <span>Score %</span>
                                    <span>± from last week</span>
                                </div>
                            </div>

                            {weakTopics.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "16px 0", color: "#999", fontSize: 13 }}>
                                    No weak areas — keep it up! 🎉
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {weakTopics.map((t, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.topic}</div>
                                                <div style={{ fontSize: 12, color: "#999" }}>{t.subject}</div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <span style={{ fontWeight: 700, fontSize: 14 }}>{t.pct}%</span>
                                                <span style={{ fontSize: 12, color: "#999" }}>0</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}
