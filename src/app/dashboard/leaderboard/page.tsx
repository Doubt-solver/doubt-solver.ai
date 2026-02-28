"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const leagues = [
    { name: "Diamond", emoji: "💎", minXP: 5000, color: "#2563EB" },
    { name: "Platinum", emoji: "⚪", minXP: 3500, color: "#6B7280" },
    { name: "Gold", emoji: "🥇", minXP: 2000, color: "#D97706" },
    { name: "Silver", emoji: "🥈", minXP: 1000, color: "#9CA3AF" },
    { name: "Bronze", emoji: "🥉", minXP: 0, color: "#B45309" },
];

function getUserLeague(xp: number) {
    for (const l of leagues) {
        if (xp >= l.minXP) return l;
    }
    return leagues[leagues.length - 1];
}

interface LeaderboardUser {
    id: string;
    name: string;
    xp: number;
    level: number;
    grade: string;
}

const AVATAR_COLORS = ["#8B5CF6", "#2563EB", "#22C55E", "#F59E0B", "#EF4444"];

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/data?section=leaderboard&limit=15")
            .then((r) => r.json())
            .then((d) => {
                setLeaders(d.leaders ?? []);
                setCurrentUserId(d.currentUserId ?? "");
            })
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

    const currentUser = leaders.find((u) => u.id === currentUserId);
    const userLeague = getUserLeague(currentUser?.xp ?? 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>🏆 Leaderboard</h1>
                <p>Compete with fellow students and climb the ranks!</p>
            </div>

            {/* League Status */}
            <div className="card mt-6" style={{ textAlign: "center", padding: 28 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>{userLeague.emoji}</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: userLeague.color }}>
                    {userLeague.name} League
                </h2>
                <p className="text-muted" style={{ marginTop: 4 }}>
                    {currentUser ? `${currentUser.xp.toLocaleString()} XP` : "Take exams to earn XP!"}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 20 }}>
                    {leagues.map((l, i) => (
                        <div key={i} style={{ textAlign: "center", opacity: l.name === userLeague.name ? 1 : 0.4 }}>
                            <div style={{ fontSize: 24 }}>{l.emoji}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: l.color, marginTop: 4 }}>
                                {l.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rankings */}
            <div className="mt-8">
                <h2 className="section-title mb-4">Rankings</h2>
                {leaders.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: 40 }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                        <p className="text-muted">No rankings yet. Be the first to take an exam!</p>
                    </div>
                ) : (
                    <div className="leaderboard-list">
                        {leaders.map((user, i) => {
                            const isUser = user.id === currentUserId;
                            return (
                                <motion.div
                                    key={user.id}
                                    className={`leaderboard-item ${isUser ? "highlight" : ""}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <div
                                        className={`leaderboard-rank ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}
                                        style={{ fontSize: i < 3 ? 20 : 16 }}
                                    >
                                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                                    </div>
                                    <div className="leaderboard-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                        {user.name?.substring(0, 2).toUpperCase() || "??"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="leaderboard-name">
                                            {user.name}{" "}
                                            {isUser && <span className="text-sm text-muted">(You)</span>}
                                        </div>
                                        <div className="text-sm text-muted">Class {user.grade || "10"}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div className="leaderboard-xp">{user.xp.toLocaleString()} XP</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* League Info */}
            <div className="mt-6" style={{ display: "flex", gap: 16 }}>
                <div className="card" style={{ flex: 1, borderColor: "rgba(34, 197, 94, 0.2)" }}>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} style={{ color: "var(--primary-green)" }} />
                        <span className="font-bold text-green">League Tiers</span>
                    </div>
                    <p className="text-sm text-muted mt-4">
                        Bronze → Silver (1K XP) → Gold (2K) → Platinum (3.5K) → Diamond (5K)
                    </p>
                </div>
                <div className="card" style={{ flex: 1, borderColor: "rgba(245, 158, 11, 0.2)" }}>
                    <div className="flex items-center gap-2">
                        <Trophy size={18} style={{ color: "var(--primary-orange)" }} />
                        <span className="font-bold text-orange">How to Earn XP</span>
                    </div>
                    <p className="text-sm text-muted mt-4">
                        Take exams, maintain streaks, and complete challenges to climb the ranks!
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
