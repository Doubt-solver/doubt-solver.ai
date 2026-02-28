"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BadgeDef {
    key: string;
    name: string;
    icon: string;
    desc: string;
}

interface EarnedBadge {
    badge_key: string;
    earned_at: string;
}

export default function BadgesPage() {
    const [definitions, setDefinitions] = useState<BadgeDef[]>([]);
    const [earned, setEarned] = useState<EarnedBadge[]>([]);
    const [newBadges, setNewBadges] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/data?section=badges")
            .then((r) => r.json())
            .then((d) => {
                setDefinitions(d.definitions ?? []);
                setEarned(d.earned ?? []);
                setNewBadges(d.newBadges ?? []);
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

    const earnedKeys = new Set(earned.map((e) => e.badge_key));
    const earnedBadges = definitions.filter((d) => earnedKeys.has(d.key));
    const lockedBadges = definitions.filter((d) => !earnedKeys.has(d.key));
    const earnedCount = earnedBadges.length;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>🎖️ Badges & Achievements</h1>
                <p>
                    {earnedCount} of {definitions.length} badges earned — keep going!
                </p>
            </div>

            {/* New badges notification */}
            {newBadges.length > 0 && (
                <motion.div
                    className="card mt-4"
                    style={{
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(37, 99, 235, 0.06))",
                        borderColor: "rgba(34, 197, 94, 0.15)",
                        textAlign: "center",
                        padding: 20,
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                    <div className="font-extrabold text-green">
                        You just earned {newBadges.length} new badge{newBadges.length > 1 ? "s" : ""}!
                    </div>
                    <div className="text-sm text-muted mt-4">
                        {newBadges
                            .map((key) => definitions.find((d) => d.key === key)?.name)
                            .filter(Boolean)
                            .join(", ")}
                    </div>
                </motion.div>
            )}

            {/* Progress */}
            <div className="mt-6">
                <div className="xp-bar-container" style={{ height: 12 }}>
                    <motion.div
                        className="xp-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${definitions.length > 0 ? (earnedCount / definitions.length) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        style={{
                            background: "linear-gradient(90deg, var(--primary-purple), var(--primary-blue))",
                        }}
                    />
                </div>
                <div className="xp-bar-label">
                    {earnedCount}/{definitions.length} achievements unlocked
                </div>
            </div>

            {/* Earned Badges */}
            <div className="mt-8">
                <h2 className="section-title mb-4">✅ Earned</h2>
                {earnedBadges.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: 32 }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                        <p className="text-muted">Take your first exam to start earning badges!</p>
                    </div>
                ) : (
                    <div className="badge-grid">
                        {earnedBadges.map((badge, i) => (
                            <motion.div
                                key={badge.key}
                                className="badge-item"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.08, rotate: 2 }}
                                title={badge.desc}
                            >
                                <div className="badge-icon">{badge.icon}</div>
                                <div className="badge-name">{badge.name}</div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Locked Badges */}
            <div className="mt-8">
                <h2 className="section-title mb-4">🔒 Locked</h2>
                <div className="badge-grid">
                    {lockedBadges.map((badge, i) => (
                        <motion.div
                            key={badge.key}
                            className="badge-item locked"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            transition={{ delay: 0.3 + i * 0.03 }}
                            title={badge.desc}
                        >
                            <div className="badge-icon">{badge.icon}</div>
                            <div className="badge-name">{badge.name}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{badge.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
