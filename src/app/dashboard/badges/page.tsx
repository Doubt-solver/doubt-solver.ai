"use client";

import { motion } from "framer-motion";

const badges = [
    { name: "First Exam", icon: "📝", desc: "Complete your first exam", earned: true },
    { name: "Sharp Shooter", icon: "🎯", desc: "Get 5 perfect scores", earned: true },
    { name: "Bookworm", icon: "📚", desc: "Complete 50 study sessions", earned: false, progress: "32/50" },
    { name: "On Fire", icon: "🔥", desc: "30-day streak", earned: false, progress: "12/30" },
    { name: "Quick Thinker", icon: "⚡", desc: "Answer 10 questions in under 30s each", earned: true },
    { name: "Subject Master", icon: "🧠", desc: "Score 90%+ in all topics of a subject", earned: false, progress: "4/12" },
    { name: "Social Learner", icon: "👥", desc: "Join a study group", earned: false },
    { name: "Diamond Champion", icon: "💎", desc: "Reach Diamond league", earned: false },
    { name: "Perfect Week", icon: "⭐", desc: "Practice every day for a week", earned: true },
    { name: "Century Club", icon: "💯", desc: "Score 100% on 10 exams", earned: false, progress: "3/10" },
    { name: "Early Bird", icon: "🌅", desc: "Practice before 7 AM", earned: true },
    { name: "Night Owl", icon: "🌙", desc: "Practice after 10 PM", earned: true },
    { name: "Math Wizard", icon: "🧮", desc: "Complete all Math topics", earned: false, progress: "5/12" },
    { name: "Science Pro", icon: "🔬", desc: "Complete all Science topics", earned: false, progress: "4/15" },
    { name: "Streak Legend", icon: "🏆", desc: "100-day streak", earned: false, progress: "12/100" },
];

export default function BadgesPage() {
    const earnedCount = badges.filter((b) => b.earned).length;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>🎖️ Badges & Achievements</h1>
                <p>
                    {earnedCount} of {badges.length} badges earned — keep going!
                </p>
            </div>

            {/* Progress */}
            <div className="mt-6">
                <div className="xp-bar-container" style={{ height: 12 }}>
                    <motion.div
                        className="xp-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(earnedCount / badges.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        style={{
                            background: "linear-gradient(90deg, var(--primary-purple), var(--primary-blue))",
                        }}
                    />
                </div>
                <div className="xp-bar-label">
                    {earnedCount}/{badges.length} achievements unlocked
                </div>
            </div>

            {/* Earned Badges */}
            <div className="mt-8">
                <h2 className="section-title mb-4">✅ Earned</h2>
                <div className="badge-grid">
                    {badges
                        .filter((b) => b.earned)
                        .map((badge, i) => (
                            <motion.div
                                key={i}
                                className="badge-item"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.08, rotate: 2 }}
                            >
                                <div className="badge-icon">{badge.icon}</div>
                                <div className="badge-name">{badge.name}</div>
                            </motion.div>
                        ))}
                </div>
            </div>

            {/* In Progress */}
            <div className="mt-8">
                <h2 className="section-title mb-4">🔒 Locked</h2>
                <div className="badge-grid">
                    {badges
                        .filter((b) => !b.earned)
                        .map((badge, i) => (
                            <motion.div
                                key={i}
                                className="badge-item locked"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                transition={{ delay: 0.3 + i * 0.03 }}
                                title={badge.desc}
                            >
                                <div className="badge-icon">{badge.icon}</div>
                                <div className="badge-name">{badge.name}</div>
                                {badge.progress && (
                                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                                        {badge.progress}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                </div>
            </div>
        </motion.div>
    );
}
