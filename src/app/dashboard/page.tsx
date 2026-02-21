"use client";

import { motion } from "framer-motion";
import type { Easing } from "framer-motion";
import Link from "next/link";
import {
    Flame,
    Zap,
    Trophy,
    Star,
    ArrowRight,
    BookOpen,
    FlaskConical,
    Calculator,
    Globe,
    Laptop,
} from "lucide-react";

const fadeIn = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" as Easing },
    }),
};

const subjects = [
    {
        name: "Mathematics",
        icon: <Calculator size={24} />,
        color: "#1CB0F6",
        bg: "rgba(28, 176, 246, 0.15)",
        topics: 12,
        progress: 45,
    },
    {
        name: "Science",
        icon: <FlaskConical size={24} />,
        color: "#58CC02",
        bg: "rgba(88, 204, 2, 0.15)",
        topics: 15,
        progress: 32,
    },
    {
        name: "English",
        icon: <BookOpen size={24} />,
        color: "#CE82FF",
        bg: "rgba(206, 130, 255, 0.15)",
        topics: 10,
        progress: 68,
    },
    {
        name: "Social Science",
        icon: <Globe size={24} />,
        color: "#FF9600",
        bg: "rgba(255, 150, 0, 0.15)",
        topics: 14,
        progress: 20,
    },
    {
        name: "Computer Science",
        icon: <Laptop size={24} />,
        color: "#FF4B4B",
        bg: "rgba(255, 75, 75, 0.15)",
        topics: 8,
        progress: 55,
    },
];

const recentExams = [
    { subject: "Mathematics", topic: "Quadratic Equations", score: 85, total: 100, date: "Today" },
    { subject: "Science", topic: "Chemical Reactions", score: 72, total: 100, date: "Yesterday" },
    { subject: "English", topic: "Grammar — Tenses", score: 90, total: 100, date: "2 days ago" },
];

const leaderboard = [
    { name: "Ananya K.", xp: 2450, avatar: "AK", color: "#CE82FF" },
    { name: "Priya M.", xp: 2380, avatar: "PM", color: "#1CB0F6" },
    { name: "Rahul S.", xp: 2100, avatar: "RS", color: "#58CC02", isUser: true },
    { name: "Vikram J.", xp: 1950, avatar: "VJ", color: "#FF9600" },
    { name: "Sneha R.", xp: 1820, avatar: "SR", color: "#FF4B4B" },
];

export default function DashboardPage() {
    const currentXP = 2100;
    const nextLevelXP = 3000;
    const xpProgress = (currentXP / nextLevelXP) * 100;

    return (
        <motion.div initial="hidden" animate="visible">
            {/* Header with greeting and streak */}
            <motion.div
                className="page-header"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
                variants={fadeIn}
                custom={0}
            >
                <div>
                    <h1>Hey Rahul! 👋</h1>
                    <p>Ready to crush some exams today?</p>
                </div>
                <div className="streak-badge">
                    <span className="streak-fire">🔥</span>
                    <span>12 Day Streak</span>
                </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div className="stats-grid" variants={fadeIn} custom={1}>
                <motion.div
                    className="stat-card"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="stat-card-value text-orange">
                        <Flame size={22} style={{ display: "inline", verticalAlign: "middle" }} /> 12
                    </div>
                    <div className="stat-card-label">Day Streak</div>
                </motion.div>
                <motion.div
                    className="stat-card"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="stat-card-value text-green">
                        <Zap size={22} style={{ display: "inline", verticalAlign: "middle" }} /> 2,100
                    </div>
                    <div className="stat-card-label">Total XP</div>
                </motion.div>
                <motion.div
                    className="stat-card"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="stat-card-value text-blue">
                        <Trophy size={22} style={{ display: "inline", verticalAlign: "middle" }} /> Gold
                    </div>
                    <div className="stat-card-label">League</div>
                </motion.div>
                <motion.div
                    className="stat-card"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="stat-card-value text-purple">
                        <Star size={22} style={{ display: "inline", verticalAlign: "middle" }} /> 4
                    </div>
                    <div className="stat-card-label">Level</div>
                </motion.div>
            </motion.div>

            {/* XP Progress */}
            <motion.div className="mt-6" variants={fadeIn} custom={2}>
                <div className="flex items-center justify-between mb-4">
                    <span className="font-bold">Level 4 — Scholar</span>
                    <span className="text-sm text-muted">
                        {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                    </span>
                </div>
                <div className="xp-bar-container">
                    <motion.div
                        className="xp-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    />
                </div>
                <div className="xp-bar-label">
                    {nextLevelXP - currentXP} XP to Level 5 (Expert)
                </div>
            </motion.div>

            {/* Subjects */}
            <motion.div className="mt-8" variants={fadeIn} custom={3}>
                <div className="section-header">
                    <h2 className="section-title">Your Subjects</h2>
                    <Link href="/dashboard/subjects" className="section-link">
                        View All <ArrowRight size={14} style={{ display: "inline" }} />
                    </Link>
                </div>
                <div className="subject-grid">
                    {subjects.map((subject, i) => (
                        <motion.div
                            key={i}
                            className="subject-card"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div
                                className="subject-card-icon"
                                style={{ background: subject.bg, color: subject.color }}
                            >
                                {subject.icon}
                            </div>
                            <div className="subject-card-title">{subject.name}</div>
                            <div className="subject-card-desc">
                                {subject.topics} topics · {subject.progress}% complete
                            </div>
                            <div className="subject-card-progress">
                                <div className="xp-bar-container" style={{ height: 8 }}>
                                    <motion.div
                                        className="xp-bar-fill"
                                        style={{
                                            background: `linear-gradient(90deg, ${subject.color}, ${subject.color}cc)`,
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${subject.progress}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Exams */}
            <motion.div className="mt-8" variants={fadeIn} custom={4}>
                <div className="section-header">
                    <h2 className="section-title">Recent Exams</h2>
                    <Link href="/dashboard/exam" className="section-link">
                        Take New Exam <ArrowRight size={14} style={{ display: "inline" }} />
                    </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {recentExams.map((exam, i) => (
                        <motion.div
                            key={i}
                            className="card"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                            whileHover={{ scale: 1.01 }}
                        >
                            <div>
                                <div className="font-bold">{exam.topic}</div>
                                <div className="text-sm text-muted">
                                    {exam.subject} · {exam.date}
                                </div>
                            </div>
                            <div>
                                <span
                                    className="font-extrabold"
                                    style={{
                                        fontSize: 22,
                                        color:
                                            exam.score >= 80
                                                ? "var(--primary-green)"
                                                : exam.score >= 60
                                                    ? "var(--primary-orange)"
                                                    : "var(--primary-red)",
                                    }}
                                >
                                    {exam.score}%
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Mini Leaderboard */}
            <motion.div className="mt-8" variants={fadeIn} custom={5}>
                <div className="section-header">
                    <h2 className="section-title">🏆 Gold League</h2>
                    <Link href="/dashboard/leaderboard" className="section-link">
                        Full Standings <ArrowRight size={14} style={{ display: "inline" }} />
                    </Link>
                </div>
                <div className="leaderboard-list">
                    {leaderboard.map((user, i) => (
                        <motion.div
                            key={i}
                            className={`leaderboard-item ${user.isUser ? "highlight" : ""}`}
                            whileHover={{ x: 4 }}
                        >
                            <div
                                className={`leaderboard-rank ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""
                                    }`}
                            >
                                {i + 1}
                            </div>
                            <div
                                className="leaderboard-avatar"
                                style={{ background: user.color }}
                            >
                                {user.avatar}
                            </div>
                            <div className="leaderboard-name">
                                {user.name}{" "}
                                {user.isUser && (
                                    <span className="text-sm text-muted">(You)</span>
                                )}
                            </div>
                            <div className="leaderboard-xp">
                                {user.xp.toLocaleString()} XP
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="mt-8 mb-6"
                variants={fadeIn}
                custom={6}
                style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
                <Link href="/dashboard/exam" className="btn btn-primary">
                    <Zap size={18} /> Take Quick Exam
                </Link>
                <Link href="/dashboard/doubts" className="btn btn-blue">
                    <BookOpen size={18} /> Ask a Doubt
                </Link>
                <Link href="/dashboard/subjects" className="btn btn-outline">
                    <BookOpen size={18} /> Study Material
                </Link>
            </motion.div>
        </motion.div>
    );
}
