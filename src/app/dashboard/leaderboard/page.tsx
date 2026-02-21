"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

const leaderboardData = [
    { name: "Ananya K.", xp: 3250, avatar: "AK", color: "#CE82FF", grade: "10th", trend: "up" },
    { name: "Priya M.", xp: 3120, avatar: "PM", color: "#1CB0F6", grade: "10th", trend: "up" },
    { name: "Rahul S.", xp: 2100, avatar: "RS", color: "#58CC02", grade: "10th", trend: "same", isUser: true },
    { name: "Vikram J.", xp: 1950, avatar: "VJ", color: "#FF9600", grade: "9th", trend: "down" },
    { name: "Sneha R.", xp: 1820, avatar: "SR", color: "#FF4B4B", grade: "10th", trend: "up" },
    { name: "Arjun D.", xp: 1750, avatar: "AD", color: "#1CB0F6", grade: "9th", trend: "same" },
    { name: "Kavya S.", xp: 1680, avatar: "KS", color: "#CE82FF", grade: "10th", trend: "down" },
    { name: "Rohan P.", xp: 1540, avatar: "RP", color: "#FF9600", grade: "9th", trend: "up" },
    { name: "Diya N.", xp: 1420, avatar: "DN", color: "#58CC02", grade: "10th", trend: "down" },
    { name: "Aditya V.", xp: 1350, avatar: "AV", color: "#FF4B4B", grade: "9th", trend: "same" },
];

const leagues = [
    { name: "Diamond", emoji: "💎", minXP: 5000, color: "#1CB0F6" },
    { name: "Platinum", emoji: "⚪", minXP: 3500, color: "#93B1BF" },
    { name: "Gold", emoji: "🥇", minXP: 2000, color: "#FFC800" },
    { name: "Silver", emoji: "🥈", minXP: 1000, color: "#C0C0C0" },
    { name: "Bronze", emoji: "🥉", minXP: 0, color: "#CD7F32" },
];

export default function LeaderboardPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>🏆 Leaderboard</h1>
                <p>Compete with fellow students and climb the ranks!</p>
            </div>

            {/* League Status */}
            <div className="card mt-6" style={{ textAlign: "center", padding: 28 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🥇</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--primary-yellow)" }}>
                    Gold League
                </h2>
                <p className="text-muted" style={{ marginTop: 4 }}>
                    Top 10 promoted to Platinum · Bottom 5 demoted to Silver
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 20 }}>
                    {leagues.map((l, i) => (
                        <div key={i} style={{ textAlign: "center", opacity: l.name === "Gold" ? 1 : 0.4 }}>
                            <div style={{ fontSize: 24 }}>{l.emoji}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: l.color, marginTop: 4 }}>
                                {l.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* This Week's Rankings */}
            <div className="mt-8">
                <h2 className="section-title mb-4">This Week&apos;s Rankings</h2>
                <div className="leaderboard-list">
                    {leaderboardData.map((user, i) => (
                        <motion.div
                            key={i}
                            className={`leaderboard-item ${user.isUser ? "highlight" : ""}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ x: 4 }}
                        >
                            <div
                                className={`leaderboard-rank ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""
                                    }`}
                                style={{ fontSize: i < 3 ? 20 : 16 }}
                            >
                                {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                            </div>
                            <div className="leaderboard-avatar" style={{ background: user.color }}>
                                {user.avatar}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="leaderboard-name">
                                    {user.name}{" "}
                                    {user.isUser && <span className="text-sm text-muted">(You)</span>}
                                </div>
                                <div className="text-sm text-muted">Class {user.grade}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {user.trend === "up" && <TrendingUp size={16} style={{ color: "var(--primary-green)" }} />}
                                {user.trend === "down" && <TrendingDown size={16} style={{ color: "var(--primary-red)" }} />}
                                {user.trend === "same" && <Minus size={16} style={{ color: "var(--text-muted)" }} />}
                                <div className="leaderboard-xp">{user.xp.toLocaleString()} XP</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Promotion / Demotion zone markers */}
            <div className="mt-6" style={{ display: "flex", gap: 16 }}>
                <div className="card" style={{ flex: 1, borderColor: "rgba(88, 204, 2, 0.3)" }}>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} style={{ color: "var(--primary-green)" }} />
                        <span className="font-bold text-green">Promotion Zone</span>
                    </div>
                    <p className="text-sm text-muted mt-4">Top 10 players advance to Platinum League</p>
                </div>
                <div className="card" style={{ flex: 1, borderColor: "rgba(255, 75, 75, 0.3)" }}>
                    <div className="flex items-center gap-2">
                        <TrendingDown size={18} style={{ color: "var(--primary-red)" }} />
                        <span className="font-bold text-red">Demotion Zone</span>
                    </div>
                    <p className="text-sm text-muted mt-4">Bottom 5 players drop to Silver League</p>
                </div>
            </div>
        </motion.div>
    );
}
