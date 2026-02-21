"use client";

import { motion } from "framer-motion";
import { User, Bell, Palette, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
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
                    <input className="form-input" defaultValue="Rahul Sharma" />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" defaultValue="rahul.sharma@gmail.com" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Grade</label>
                        <select className="form-select">
                            <option>Class 6</option>
                            <option>Class 7</option>
                            <option>Class 8</option>
                            <option>Class 9</option>
                            <option selected>Class 10</option>
                            <option>Class 11</option>
                            <option>Class 12</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Board</label>
                        <select className="form-select">
                            <option selected>CBSE</option>
                            <option>ICSE</option>
                            <option>State Board</option>
                        </select>
                    </div>
                </div>
                <button className="btn btn-primary mt-4">Save Changes</button>
            </div>

            {/* Notifications */}
            <div className="card mt-6">
                <div className="flex items-center gap-3 mb-6">
                    <Bell size={20} style={{ color: "var(--primary-orange)" }} />
                    <h2 className="font-extrabold text-lg">Notifications</h2>
                </div>
                {[
                    { label: "Streak reminders", desc: "Get reminded to maintain your streak" },
                    { label: "Weekly progress report", desc: "Summary of your weekly performance" },
                    { label: "New exam recommendations", desc: "When AI suggests new practice exams" },
                    { label: "Leaderboard updates", desc: "When your ranking changes" },
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
                                background: i < 2 ? "var(--primary-green)" : "var(--bg-input)",
                                position: "relative",
                                cursor: "pointer",
                                transition: "background 0.2s",
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    top: 3,
                                    left: i < 2 ? 24 : 3,
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
                    <select className="form-select">
                        <option selected>Dark Mode</option>
                        <option>Light Mode</option>
                        <option>System Default</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Daily Goal</label>
                    <select className="form-select">
                        <option>Casual (5 min/day)</option>
                        <option selected>Regular (15 min/day)</option>
                        <option>Serious (30 min/day)</option>
                        <option>Intense (60 min/day)</option>
                    </select>
                </div>
            </div>

            {/* Danger Zone */}
            <div
                className="card mt-6 mb-6"
                style={{ borderColor: "rgba(255, 75, 75, 0.3)" }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <Shield size={20} style={{ color: "var(--primary-red)" }} />
                    <h2 className="font-extrabold text-lg">Account</h2>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-bold text-sm">Sign Out</div>
                        <div className="text-sm text-muted">Sign out of your account</div>
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ color: "var(--primary-red)", borderColor: "rgba(255, 75, 75, 0.3)" }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
