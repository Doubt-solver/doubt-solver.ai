"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    GraduationCap,
    Mail,
    Phone,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginMethod = "phone" | "email";

export default function LoginPage() {
    const router = useRouter();
    const [method, setMethod] = useState<LoginMethod>("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState("");

    const supabase = createClient();

    // ─── Google OAuth ─────────────────────────────

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    // ─── Phone OTP ────────────────────────────────

    const formatPhone = (raw: string) => {
        // Add +91 prefix if not present
        const cleaned = raw.replace(/\s/g, "");
        if (cleaned.startsWith("+")) return cleaned;
        if (cleaned.startsWith("91") && cleaned.length > 10) return `+${cleaned}`;
        return `+91${cleaned}`;
    };

    const handleSendPhoneOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }

        setLoading(true);
        setError("");

        const formattedPhone = formatPhone(phone.trim());
        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
        });

        if (error) {
            setError(error.message);
        } else {
            setOtpSent(true);
        }
        setLoading(false);
    };

    const handleVerifyPhoneOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return;

        setLoading(true);
        setError("");

        const formattedPhone = formatPhone(phone.trim());
        const { data, error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token: otp,
            type: "sms",
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data.session) {
            // Session is set automatically via cookies by @supabase/ssr
            // Check if new user needs onboarding
            const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", data.user?.id)
                .single();

            if (!profile && data.user) {
                // Create profile for new phone user
                await supabase.from("profiles").insert({
                    id: data.user.id,
                    name: "Student",
                    grade: "Class 10",
                    board: "CBSE",
                    xp: 0,
                    level: 1,
                    streak: 0,
                    last_active: new Date().toISOString().split("T")[0],
                });
                router.push("/auth/onboarding");
            } else {
                router.push("/dashboard");
            }
        }
    };

    // ─── Email Magic Link ─────────────────────────

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setEmailSent(true);
        }
        setLoading(false);
    };

    // ─── Render ───────────────────────────────────

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div className="landing-orb landing-orb-1" />
            <div className="landing-orb landing-orb-2" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 2 }}
            >
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <div className="sidebar-logo-icon">
                            <GraduationCap size={22} color="white" />
                        </div>
                        <span className="sidebar-logo-text" style={{ fontSize: 24 }}>DoubtSolver.ai</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: 32, borderColor: "var(--border-default)" }}>
                    <AnimatePresence mode="wait">
                        {/* ─── Email Sent State ─── */}
                        {emailSent ? (
                            <motion.div
                                key="email-sent"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: "center", padding: "16px 0" }}
                            >
                                <CheckCircle2 size={48} style={{ color: "var(--primary-green)", marginBottom: 16 }} />
                                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Check your email!</h2>
                                <p className="text-muted" style={{ fontSize: 15, marginBottom: 24 }}>
                                    We sent a magic link to <strong>{email}</strong>. Click it to sign in.
                                </p>
                                <button className="btn btn-outline btn-sm" onClick={() => { setEmailSent(false); setEmail(""); }}>
                                    Try another method
                                </button>
                            </motion.div>

                        ) : otpSent ? (
                            /* ─── OTP Verify State ─── */
                            <motion.div
                                key="otp-verify"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>
                                    Enter OTP 🔐
                                </h1>
                                <p className="text-muted" style={{ textAlign: "center", marginBottom: 28, fontSize: 15 }}>
                                    We sent a 6-digit code to <strong>{formatPhone(phone)}</strong>
                                </p>

                                <form onSubmit={handleVerifyPhoneOTP}>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ fontSize: 24, letterSpacing: 8, textAlign: "center", padding: "16px 20px" }}
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-full"
                                        disabled={loading || otp.length < 6}
                                        style={{ opacity: loading || otp.length < 6 ? 0.6 : 1, padding: "14px 24px" }}
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Sign In"}
                                        <ArrowRight size={16} />
                                    </button>
                                </form>

                                <div style={{ textAlign: "center", marginTop: 16 }}>
                                    <button
                                        onClick={() => { setOtpSent(false); setOtp(""); }}
                                        style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 14, cursor: "pointer", textDecoration: "underline" }}
                                    >
                                        Change number
                                    </button>
                                </div>
                            </motion.div>

                        ) : (
                            /* ─── Main Login Form ─── */
                            <motion.div key="login-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>
                                    Welcome! 👋
                                </h1>
                                <p className="text-muted" style={{ textAlign: "center", marginBottom: 28, fontSize: 15 }}>
                                    Sign in to start your learning journey
                                </p>

                                {/* Google */}
                                <button
                                    className="btn btn-full"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    style={{
                                        background: "var(--bg-elevated)",
                                        border: "2px solid var(--border-default)",
                                        color: "var(--text-primary)",
                                        padding: "14px 24px",
                                        fontSize: 15,
                                        marginBottom: 20,
                                        cursor: loading ? "not-allowed" : "pointer",
                                        opacity: loading ? 0.6 : 1,
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>

                                {/* Divider */}
                                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                                    <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                                    <span className="text-sm text-muted" style={{ fontWeight: 600 }}>or</span>
                                    <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                                </div>

                                {/* Method Tabs */}
                                <div
                                    style={{
                                        display: "flex",
                                        borderRadius: "var(--radius-md)",
                                        background: "var(--bg-input)",
                                        padding: 4,
                                        marginBottom: 20,
                                        gap: 4,
                                    }}
                                >
                                    {[
                                        { id: "phone" as LoginMethod, label: "Mobile OTP", icon: <Phone size={16} /> },
                                        { id: "email" as LoginMethod, label: "Email Link", icon: <Mail size={16} /> },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => { setMethod(tab.id); setError(""); }}
                                            style={{
                                                flex: 1,
                                                padding: "10px 16px",
                                                borderRadius: "var(--radius-sm)",
                                                border: "none",
                                                background: method === tab.id ? "var(--bg-card)" : "transparent",
                                                color: method === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                                                fontWeight: 700,
                                                fontSize: 14,
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6,
                                                transition: "all 0.2s",
                                                boxShadow: method === tab.id ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                                            }}
                                        >
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Phone OTP Form */}
                                {method === "phone" && (
                                    <form onSubmit={handleSendPhoneOTP}>
                                        <div className="form-group">
                                            <label className="form-label">Mobile Number</label>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <div
                                                    style={{
                                                        padding: "12px 14px",
                                                        borderRadius: "var(--radius-md)",
                                                        background: "var(--bg-input)",
                                                        border: "2px solid var(--border-default)",
                                                        color: "var(--text-muted)",
                                                        fontWeight: 700,
                                                        fontSize: 15,
                                                        lineHeight: "1.4",
                                                    }}
                                                >
                                                    🇮🇳 +91
                                                </div>
                                                <input
                                                    type="tel"
                                                    className="form-input"
                                                    style={{ flex: 1 }}
                                                    placeholder="9876543210"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                    maxLength={10}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-full"
                                            disabled={loading || phone.replace(/\D/g, "").length < 10}
                                            style={{
                                                opacity: loading || phone.replace(/\D/g, "").length < 10 ? 0.6 : 1,
                                                cursor: loading || phone.replace(/\D/g, "").length < 10 ? "not-allowed" : "pointer",
                                                padding: "14px 24px",
                                            }}
                                        >
                                            <Phone size={18} />
                                            {loading ? "Sending OTP..." : "Send OTP"}
                                            <ArrowRight size={16} />
                                        </button>
                                    </form>
                                )}

                                {/* Email Form */}
                                {method === "email" && (
                                    <form onSubmit={handleEmailLogin}>
                                        <div className="form-group">
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                placeholder="your.email@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-full"
                                            disabled={loading || !email.trim()}
                                            style={{
                                                opacity: loading || !email.trim() ? 0.6 : 1,
                                                cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                                                padding: "14px 24px",
                                            }}
                                        >
                                            <Mail size={18} />
                                            {loading ? "Sending..." : "Send Magic Link"}
                                            <ArrowRight size={16} />
                                        </button>
                                    </form>
                                )}

                                {/* Error */}
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ color: "var(--primary-red)", fontSize: 14, textAlign: "center", marginTop: 16, fontWeight: 600 }}
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <p className="text-muted" style={{ textAlign: "center", fontSize: 13, marginTop: 20 }}>
                    <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                    Free forever for students. No credit card needed.
                </p>
            </motion.div>
        </div>
    );
}
