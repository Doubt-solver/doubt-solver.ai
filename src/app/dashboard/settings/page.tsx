"use client";

import { motion } from "framer-motion";
import { User, Bell, Palette, Shield, LogOut, Loader2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [grade, setGrade] = useState("Class 10");
    const [board, setBoard] = useState("CBSE");

    useEffect(() => {
        fetch("/api/user/data?section=profile")
            .then((r) => r.json())
            .then((d) => {
                if (d.profile) {
                    setName(d.profile.name || "");
                    setGrade(d.profile.grade || "Class 10");
                    setBoard(d.profile.board || "CBSE");
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, grade, board }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch {
            // silently fail
        }
        setSaving(false);
    };

    const handleSignOut = async () => {
        await fetch("/auth/callback?action=signout");
        router.push("/auth/login");
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary-green)" }} />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>⚙️ Settings</h1>
                <p>Manage your account and preferences</p>
            </div>

            {/* Profile */}
            <div className="card mt-6">
                <div className="flex items-center gap-3 mb-6">
                    <User size={20} style={{ color: "var(--primary-blue)" }} />
                    <h2 className="font-extrabold text-lg">Profile</h2>
                </div>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Grade</label>
                        <select className="form-select" value={grade} onChange={(e) => setGrade(e.target.value)}>
                            <option>Class 6</option>
                            <option>Class 7</option>
                            <option>Class 8</option>
                            <option>Class 9</option>
                            <option>Class 10</option>
                            <option>Class 11</option>
                            <option>Class 12</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Board</label>
                        <select className="form-select" value={board} onChange={(e) => setBoard(e.target.value)}>
                            <option>CBSE</option>
                            <option>ICSE</option>
                            <option>State Board</option>
                        </select>
                    </div>
                </div>
                <button className="btn btn-primary mt-4" onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : saved ? (
                        <><Check size={16} /> Saved!</>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>

            {/* Notifications */}
            <div className="card mt-6">
                <div className="flex items-center gap-3 mb-6">
                    <Bell size={20} style={{ color: "var(--primary-orange)" }} />
                    <h2 className="font-extrabold text-lg">Notifications</h2>
                </div>
                {[
                    { label: "Streak reminders", desc: "Get reminded to maintain your streak", on: true },
                    { label: "Weekly progress report", desc: "Summary of your weekly performance", on: true },
                    { label: "New exam recommendations", desc: "When AI suggests new practice exams", on: false },
                    { label: "Leaderboard updates", desc: "When your ranking changes", on: false },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between"
                        style={{
                            padding: "12px 0",
                            borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none",
                        }}
                    >
                        <div>
                            <div className="font-bold text-sm">{item.label}</div>
                            <div className="text-sm text-muted">{item.desc}</div>
                        </div>
                        <label
                            style={{
                                width: 48,
                                height: 26,
                                borderRadius: 13,
                                background: item.on ? "var(--primary-green)" : "var(--bg-input)",
                                position: "relative",
                                cursor: "pointer",
                                transition: "background 0.2s",
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    top: 3,
                                    left: item.on ? 24 : 3,
                                    width: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    background: "white",
                                    transition: "left 0.2s",
                                }}
                            />
                        </label>
                    </div>
                ))}
            </div>

            {/* Appearance */}
            <div className="card mt-6">
                <div className="flex items-center gap-3 mb-6">
                    <Palette size={20} style={{ color: "var(--primary-purple)" }} />
                    <h2 className="font-extrabold text-lg">Appearance</h2>
                </div>
                <div className="form-group">
                    <label className="form-label">Theme</label>
                    <select className="form-select" defaultValue="Light Mode">
                        <option>Dark Mode</option>
                        <option>Light Mode</option>
                        <option>System Default</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Daily Goal</label>
                    <select className="form-select" defaultValue="Regular (15 min/day)">
                        <option>Casual (5 min/day)</option>
                        <option>Regular (15 min/day)</option>
                        <option>Serious (30 min/day)</option>
                        <option>Intense (60 min/day)</option>
                    </select>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card mt-6 mb-6" style={{ borderColor: "rgba(239, 68, 68, 0.15)" }}>
                <div className="flex items-center gap-3 mb-6">
                    <Shield size={20} style={{ color: "var(--primary-red)" }} />
                    <h2 className="font-extrabold text-lg">Account</h2>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-bold text-sm">Sign Out</div>
                        <div className="text-sm text-muted">Sign out of your account</div>
                    </div>
                    <button
                        className="btn btn-outline btn-sm"
                        style={{ color: "var(--primary-red)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                        onClick={handleSignOut}
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
