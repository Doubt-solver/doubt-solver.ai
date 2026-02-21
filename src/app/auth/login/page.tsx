"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    GraduationCap,
    Mail,
    ArrowRight,
    Sparkles,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState("");

    const supabase = createClient();

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
            {/* Background orbs */}
            <div className="landing-orb landing-orb-1" />
            <div className="landing-orb landing-orb-2" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: "100%",
                    maxWidth: 420,
                    position: "relative",
                    zIndex: 2,
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <Link
                        href="/"
                        style={{
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div className="sidebar-logo-icon">
                            <GraduationCap size={22} color="white" />
                        </div>
                        <span className="sidebar-logo-text" style={{ fontSize: 24 }}>
                            DoubtSolver.ai
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div
                    className="card"
                    style={{
                        padding: 32,
                        borderColor: "var(--border-default)",
                    }}
                >
                    {!emailSent ? (
                        <>
                            <h1
                                style={{
                                    fontSize: 24,
                                    fontWeight: 800,
                                    textAlign: "center",
                                    marginBottom: 4,
                                }}
                            >
                                Welcome back! 👋
                            </h1>
                            <p
                                className="text-muted"
                                style={{
                                    textAlign: "center",
                                    marginBottom: 28,
                                    fontSize: 15,
                                }}
                            >
                                Sign in to continue your learning journey
                            </p>

                            {/* Google Sign In */}
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
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </button>

                            {/* Divider */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    marginBottom: 20,
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        height: 1,
                                        background: "var(--border-subtle)",
                                    }}
                                />
                                <span
                                    className="text-sm text-muted"
                                    style={{ fontWeight: 600 }}
                                >
                                    or
                                </span>
                                <div
                                    style={{
                                        flex: 1,
                                        height: 1,
                                        background: "var(--border-subtle)",
                                    }}
                                />
                            </div>

                            {/* Email OTP */}
                            <form onSubmit={handleEmailLogin}>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-full"
                                    disabled={loading || !email.trim()}
                                    style={{
                                        opacity: loading || !email.trim() ? 0.6 : 1,
                                        cursor:
                                            loading || !email.trim() ? "not-allowed" : "pointer",
                                    }}
                                >
                                    <Mail size={18} />
                                    {loading ? "Sending..." : "Sign in with Magic Link"}
                                    <ArrowRight size={16} />
                                </button>
                            </form>

                            {/* Error */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        color: "var(--primary-red)",
                                        fontSize: 14,
                                        textAlign: "center",
                                        marginTop: 16,
                                        fontWeight: 600,
                                    }}
                                >
                                    {error}
                                </motion.p>
                            )}
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: "center", padding: "16px 0" }}
                        >
                            <CheckCircle2
                                size={48}
                                style={{ color: "var(--primary-green)", marginBottom: 16 }}
                            />
                            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                                Check your email!
                            </h2>
                            <p
                                className="text-muted"
                                style={{ fontSize: 15, marginBottom: 24 }}
                            >
                                We sent a magic link to <strong>{email}</strong>. Click the link
                                in your email to sign in.
                            </p>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setEmailSent(false);
                                    setEmail("");
                                }}
                            >
                                Try another email
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Footer note */}
                <p
                    className="text-muted"
                    style={{
                        textAlign: "center",
                        fontSize: 13,
                        marginTop: 20,
                    }}
                >
                    <Sparkles
                        size={14}
                        style={{ display: "inline", verticalAlign: "middle" }}
                    />{" "}
                    Free forever for students. No credit card needed.
                </p>
            </motion.div>
        </div>
    );
}
