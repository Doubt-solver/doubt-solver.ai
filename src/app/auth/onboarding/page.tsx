"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";

const grades = ["9th", "10th", "11th", "12th", "Other"];
const boards = ["CBSE", "ICSE", "State Board"];
const subjects = [
    { id: "mathematics", label: "Mathematics", emoji: "📐" },
    { id: "science", label: "Science", emoji: "🔬" },
    { id: "english", label: "English", emoji: "📖" },
    { id: "social", label: "Social Science", emoji: "🌍" },
    { id: "cs", label: "Computer Science", emoji: "💻" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [grade, setGrade] = useState("");
    const [board, setBoard] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Pre-fill name from auth if available
    useEffect(() => {
        const loadUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setName(
                        user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email?.split("@")[0] || ""
                    );
                }
            } catch { /* auth disabled */ }
        };
        loadUser();
    }, []);

    const toggleSubject = (id: string) => {
        setSelectedSubjects(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("profiles").upsert({
                    id: user.id,
                    name: name || "Student",
                    grade: grade ? `Class ${grade.replace("th", "")}` : "Class 10",
                    board: board || "CBSE",
                });
            }
        } catch { /* proceed anyway */ }
        router.push("/dashboard");
    };

    const canNext = () => {
        if (step === 0) return true; // welcome
        if (step === 1) return name.trim().length > 0;
        if (step === 2) return grade.length > 0;
        if (step === 3) return board.length > 0;
        if (step === 4) return true;
        return true;
    };

    const totalSteps = 5;
    const progress = ((step + 1) / totalSteps) * 100;

    const slideVariants = {
        enter: { opacity: 0, x: 40 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(180deg, #FEF3E2 0%, #FBF7F4 50%, #FBF7F4 100%)",
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
            }}>
                {step > 0 ? (
                    <button
                        onClick={() => setStep(s => s - 1)}
                        style={{
                            width: 40, height: 40,
                            borderRadius: "50%",
                            border: "1px solid #E5E0DB",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <ArrowLeft size={18} color="#1A1A1A" />
                    </button>
                ) : <div style={{ width: 40 }} />}

                {step > 0 && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 16px",
                        background: "white",
                        borderRadius: 999,
                        border: "1px solid #E5E0DB",
                        fontSize: 14,
                        fontWeight: 600,
                    }}>
                        🇮🇳 INDIA
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 24px 80px",
            }}>
                <AnimatePresence mode="wait">
                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <motion.div
                            key="welcome"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            style={{
                                textAlign: "center",
                                maxWidth: 440,
                                width: "100%",
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: 100, height: 100,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #1A1A1A, #444)",
                                margin: "0 auto 8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <GraduationCap size={44} color="white" />
                            </div>
                            <div style={{ fontSize: 32, marginBottom: 20 }}>👋</div>

                            <h1 style={{
                                fontSize: 36,
                                fontWeight: 800,
                                marginBottom: 12,
                                letterSpacing: -1,
                                color: "#1A1A1A",
                            }}>
                                Hi I&apos;m DoubtSolver.
                            </h1>
                            <p style={{
                                fontSize: 18,
                                color: "#666",
                                marginBottom: 40,
                                lineHeight: 1.5,
                            }}>
                                Let&apos;s get you set up. Which best describes you?
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <button
                                    onClick={() => setStep(1)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "20px 24px",
                                        borderRadius: 16,
                                        border: "none",
                                        background: "#1A1A1A",
                                        color: "white",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontWeight: 700, fontSize: 18 }}>Student</div>
                                        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 2 }}>I am here to learn</div>
                                    </div>
                                    <ArrowRight size={20} />
                                </button>

                                <button
                                    onClick={() => setStep(1)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "20px 24px",
                                        borderRadius: 16,
                                        border: "1px solid #E5E0DB",
                                        background: "white",
                                        color: "#1A1A1A",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontWeight: 700, fontSize: 18 }}>Teacher</div>
                                        <div style={{ fontSize: 14, color: "#999", marginTop: 2 }}>For my classroom</div>
                                    </div>
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Name */}
                    {step === 1 && (
                        <motion.div
                            key="name"
                            variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.3 }}
                            style={{ maxWidth: 480, width: "100%" }}
                        >
                            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>
                                What&apos;s your name?
                            </h1>
                            <p style={{ fontSize: 16, color: "#999", marginBottom: 32 }}>
                                This helps me personalize your experience.
                            </p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                autoFocus
                                style={{
                                    width: "100%",
                                    padding: "16px 20px",
                                    borderRadius: 12,
                                    border: "2px solid #E5E0DB",
                                    fontSize: 18,
                                    fontWeight: 600,
                                    fontFamily: "inherit",
                                    outline: "none",
                                    background: "white",
                                    color: "#1A1A1A",
                                }}
                                onKeyDown={(e) => e.key === "Enter" && canNext() && setStep(2)}
                            />
                        </motion.div>
                    )}

                    {/* Step 2: Grade */}
                    {step === 2 && (
                        <motion.div
                            key="grade"
                            variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.3 }}
                            style={{ maxWidth: 480, width: "100%" }}
                        >
                            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>
                                Which grade do you want to master?
                            </h1>
                            <p style={{ fontSize: 16, color: "#999", marginBottom: 32 }}>
                                This just helps me pick questions that feel right.
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                {grades.map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setGrade(g)}
                                        style={{
                                            padding: "10px 24px",
                                            borderRadius: 999,
                                            border: grade === g ? "2px solid #1A1A1A" : "1px solid #E5E0DB",
                                            background: grade === g ? "#1A1A1A" : "white",
                                            color: grade === g ? "white" : "#1A1A1A",
                                            fontWeight: 600,
                                            fontSize: 15,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            transition: "all 150ms ease",
                                        }}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Board */}
                    {step === 3 && (
                        <motion.div
                            key="board"
                            variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.3 }}
                            style={{ maxWidth: 480, width: "100%" }}
                        >
                            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>
                                Which board are you studying?
                            </h1>
                            <p style={{ fontSize: 16, color: "#999", marginBottom: 32 }}>
                                We&apos;ll tailor questions to your curriculum.
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {boards.map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => setBoard(b)}
                                        style={{
                                            padding: "16px 24px",
                                            borderRadius: 12,
                                            border: board === b ? "2px solid #1A1A1A" : "1px solid #E5E0DB",
                                            background: board === b ? "#1A1A1A" : "white",
                                            color: board === b ? "white" : "#1A1A1A",
                                            fontWeight: 700,
                                            fontSize: 16,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            textAlign: "left",
                                            transition: "all 150ms ease",
                                        }}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Subjects */}
                    {step === 4 && (
                        <motion.div
                            key="subjects"
                            variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.3 }}
                            style={{ maxWidth: 480, width: "100%" }}
                        >
                            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>
                                What do you want to study?
                            </h1>
                            <p style={{ fontSize: 16, color: "#999", marginBottom: 32 }}>
                                Pick one or more. You can always change later.
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {subjects.map((s) => {
                                    const active = selectedSubjects.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => toggleSubject(s.id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 14,
                                                padding: "16px 20px",
                                                borderRadius: 12,
                                                border: active ? "2px solid #1A1A1A" : "1px solid #E5E0DB",
                                                background: active ? "#F5F0EC" : "white",
                                                cursor: "pointer",
                                                fontFamily: "inherit",
                                                transition: "all 150ms ease",
                                            }}
                                        >
                                            <span style={{ fontSize: 24 }}>{s.emoji}</span>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: 16,
                                                color: "#1A1A1A",
                                            }}>
                                                {s.label}
                                            </span>
                                            {active && (
                                                <span style={{ marginLeft: "auto", fontSize: 18 }}>✓</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Bar */}
            {step > 0 && (
                <div style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px 24px",
                    background: "white",
                    borderTop: "1px solid #E5E0DB",
                }}>
                    {/* Progress bar */}
                    <div style={{
                        height: 4,
                        background: "#E5E0DB",
                        borderRadius: 999,
                        marginBottom: 16,
                        overflow: "hidden",
                    }}>
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                            style={{
                                height: "100%",
                                background: "#1A1A1A",
                                borderRadius: 999,
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button
                            onClick={handleFinish}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#999",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Skip for now
                        </button>

                        <button
                            onClick={() => {
                                if (step === 4) {
                                    handleFinish();
                                } else {
                                    setStep(s => s + 1);
                                }
                            }}
                            disabled={!canNext() || saving}
                            style={{
                                padding: "12px 32px",
                                borderRadius: 999,
                                border: "none",
                                background: canNext() ? "#1A1A1A" : "#E5E0DB",
                                color: canNext() ? "white" : "#999",
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: canNext() ? "pointer" : "not-allowed",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            {step === 4 ? (saving ? "Saving..." : "Finish") : "Continue"}
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
