"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
    X,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Trophy,
    Zap,
    RotateCcw,
    Home,
    Loader2,
} from "lucide-react";
import Link from "next/link";

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

// Fallback questions if API fails
const fallbackQuestions: Question[] = [
    {
        id: 1,
        question: "What is the value of x in the equation 2x + 6 = 14?",
        options: ["x = 2", "x = 4", "x = 6", "x = 8"],
        correctAnswer: 1,
        explanation: "2x + 6 = 14 → 2x = 8 → x = 4",
    },
    {
        id: 2,
        question: "Which gas is released during photosynthesis?",
        options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
        correctAnswer: 2,
        explanation: "During photosynthesis, plants take in CO₂ and release O₂.",
    },
    {
        id: 3,
        question: "The chemical formula of water is:",
        options: ["H₂O₂", "CO₂", "H₂O", "NaCl"],
        correctAnswer: 2,
        explanation: "Water is made up of 2 hydrogen atoms and 1 oxygen atom — H₂O.",
    },
    {
        id: 4,
        question: "What is the area of a rectangle with length 8cm and width 5cm?",
        options: ["13 cm²", "40 cm²", "26 cm²", "80 cm²"],
        correctAnswer: 1,
        explanation: "Area of rectangle = length × width = 8 × 5 = 40 cm²",
    },
    {
        id: 5,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        explanation: "Mars is called the Red Planet because of iron oxide on its surface.",
    },
];

type ExamPhase = "setup" | "loading" | "quiz" | "result";

export default function ExamPage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary-green)" }} />
            </div>
        }>
            <ExamPageContent />
        </Suspense>
    );
}

function ExamPageContent() {
    const [phase, setPhase] = useState<ExamPhase>("setup");
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);

    // Setup form state
    const searchParams = useSearchParams();
    const [subject, setSubject] = useState("Mathematics");
    const [topic, setTopic] = useState("All Topics");
    const [difficulty, setDifficulty] = useState("Medium");
    const [numQuestions, setNumQuestions] = useState(5);

    // Auto-fill from URL params (e.g. from subjects page)
    useEffect(() => {
        const paramSubject = searchParams.get("subject");
        const paramTopic = searchParams.get("topic");
        if (paramSubject) setSubject(paramSubject);
        if (paramTopic) setTopic(paramTopic);
    }, [searchParams]);

    const totalQuestions = questions.length;

    const startExam = useCallback(async () => {
        setPhase("loading");
        setCurrentQ(0);
        setSelected(null);
        setShowAnswer(false);
        setAnswers([]);
        setScore(0);

        try {
            const res = await fetch("/api/exam/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    topic: topic === "All Topics" ? `General ${subject}` : topic,
                    difficulty,
                    count: numQuestions,
                    grade: "Class 10",
                }),
            });

            const data = await res.json();

            if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
                setQuestions(data.questions);
            } else {
                // Fallback to mock data
                setQuestions(fallbackQuestions.slice(0, numQuestions));
            }
        } catch {
            // API failed, use fallback
            setQuestions(fallbackQuestions.slice(0, numQuestions));
        }

        setPhase("quiz");
    }, [subject, topic, difficulty, numQuestions]);

    const handleSelect = (index: number) => {
        if (showAnswer) return;
        setSelected(index);
    };

    const handleCheck = () => {
        if (selected === null) return;
        setShowAnswer(true);
        const isCorrect = selected === questions[currentQ].correctAnswer;
        if (isCorrect) setScore((s) => s + 1);
        setAnswers((a) => [...a, selected]);
    };

    const handleNext = () => {
        if (currentQ + 1 >= totalQuestions) {
            setPhase("result");
            // Submit results to backend
            submitResults();
        } else {
            setCurrentQ((q) => q + 1);
            setSelected(null);
            setShowAnswer(false);
        }
    };

    const submitResults = async () => {
        try {
            await fetch("/api/exam/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    topic,
                    difficulty,
                    score: score + (selected === questions[currentQ]?.correctAnswer ? 1 : 0),
                    total: totalQuestions,
                    questions,
                    answers: [...answers, selected],
                }),
            });
        } catch {
            // Silent fail — don't block user from seeing results
        }
    };

    const progress = totalQuestions > 0 ? ((currentQ + (showAnswer ? 1 : 0)) / totalQuestions) * 100 : 0;
    const finalScore = phase === "result" ? score : score;
    const scorePercent = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

    const topicOptions: Record<string, string[]> = {
        Mathematics: ["All Topics", "Algebra", "Geometry", "Trigonometry", "Number Systems", "Statistics", "Quadratic Equations", "Polynomials"],
        Science: ["All Topics", "Chemical Reactions", "Life Processes", "Light & Optics", "Electricity", "Acids, Bases & Salts", "Heredity & Evolution"],
        English: ["All Topics", "Grammar — Tenses", "Grammar — Voice", "Comprehension", "Writing — Letter", "Vocabulary"],
        "Social Science": ["All Topics", "History — French Revolution", "Geography — Resources", "Civics — Democracy", "Economics — Development"],
        "Computer Science": ["All Topics", "Python Basics", "HTML & CSS", "Networking", "Databases & SQL", "Cyber Safety"],
    };

    return (
        <div>
            {/* Setup Phase */}
            {phase === "setup" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="page-header">
                        <h1>📝 Take an Exam</h1>
                        <p>Test your knowledge with AI-generated questions</p>
                    </div>

                    <div className="card mt-6" style={{ maxWidth: 500 }}>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <select
                                className="form-select"
                                value={subject}
                                onChange={(e) => {
                                    setSubject(e.target.value);
                                    setTopic("All Topics");
                                }}
                            >
                                <option>Mathematics</option>
                                <option>Science</option>
                                <option>English</option>
                                <option>Social Science</option>
                                <option>Computer Science</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Topic</label>
                            <select
                                className="form-select"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            >
                                {(topicOptions[subject] || ["All Topics"]).map((t) => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Difficulty</label>
                            <select
                                className="form-select"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Number of Questions</label>
                            <select
                                className="form-select"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                            >
                                <option value={5}>5 Questions (Quick)</option>
                                <option value={10}>10 Questions</option>
                                <option value={15}>15 Questions</option>
                                <option value={20}>20 Questions</option>
                            </select>
                        </div>

                        <button
                            className="btn btn-primary btn-full mt-4"
                            onClick={startExam}
                        >
                            <Zap size={18} />
                            Start Exam
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Loading Phase */}
            {phase === "loading" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 400,
                        gap: 20,
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 size={48} style={{ color: "var(--primary-green)" }} />
                    </motion.div>
                    <h2 style={{ fontWeight: 800, fontSize: 22 }}>
                        AI is crafting your questions...
                    </h2>
                    <p className="text-muted" style={{ fontSize: 15 }}>
                        Generating {numQuestions} {difficulty.toLowerCase()} {subject} questions
                    </p>
                </motion.div>
            )}

            {/* Quiz Phase */}
            {phase === "quiz" && questions.length > 0 && (
                <div className="quiz-container">
                    {/* Header */}
                    <div className="quiz-header">
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setPhase("setup")}
                            title="Exit exam"
                        >
                            <X size={18} />
                        </button>
                        <div className="quiz-progress-bar">
                            <motion.div
                                className="quiz-progress-fill"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <Clock size={16} />
                            {currentQ + 1}/{totalQuestions}
                        </div>
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQ}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="quiz-question">
                                {questions[currentQ].question}
                            </div>

                            <div className="quiz-options">
                                {questions[currentQ].options.map((option, i) => {
                                    let className = "quiz-option";
                                    if (showAnswer) {
                                        if (i === questions[currentQ].correctAnswer)
                                            className += " correct";
                                        else if (i === selected) className += " wrong";
                                    } else if (i === selected) {
                                        className += " selected";
                                    }

                                    return (
                                        <motion.button
                                            key={i}
                                            className={className}
                                            onClick={() => handleSelect(i)}
                                            whileHover={!showAnswer ? { scale: 1.02 } : {}}
                                            whileTap={!showAnswer ? { scale: 0.98 } : {}}
                                        >
                                            <span className="quiz-option-label">
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            {option}
                                            {showAnswer &&
                                                i === questions[currentQ].correctAnswer && (
                                                    <CheckCircle2
                                                        size={20}
                                                        style={{
                                                            marginLeft: "auto",
                                                            color: "var(--primary-green)",
                                                        }}
                                                    />
                                                )}
                                            {showAnswer &&
                                                i === selected &&
                                                i !== questions[currentQ].correctAnswer && (
                                                    <XCircle
                                                        size={20}
                                                        style={{
                                                            marginLeft: "auto",
                                                            color: "var(--primary-red)",
                                                        }}
                                                    />
                                                )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Answer Banner */}
                    <AnimatePresence>
                        {showAnswer && (
                            <motion.div
                                className={`result-banner ${selected === questions[currentQ].correctAnswer
                                    ? "correct"
                                    : "wrong"
                                    }`}
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                exit={{ y: 100 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="result-banner-text">
                                    {selected === questions[currentQ].correctAnswer ? (
                                        <>
                                            <CheckCircle2
                                                size={24}
                                                style={{ color: "var(--primary-green)" }}
                                            />
                                            <span style={{ color: "var(--primary-green)" }}>
                                                Correct! +10 XP
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle
                                                size={24}
                                                style={{ color: "var(--primary-red)" }}
                                            />
                                            <div>
                                                <div style={{ color: "var(--primary-red)" }}>
                                                    Incorrect
                                                </div>
                                                <div className="text-sm text-muted" style={{ fontWeight: 500 }}>
                                                    {questions[currentQ].explanation}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button className="btn btn-primary" onClick={handleNext}>
                                    {currentQ + 1 >= totalQuestions ? "See Results" : "Continue"}
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Check Button */}
                    {!showAnswer && (
                        <div style={{ marginTop: 24, textAlign: "center" }}>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleCheck}
                                disabled={selected === null}
                                style={{
                                    opacity: selected === null ? 0.5 : 1,
                                    cursor: selected === null ? "not-allowed" : "pointer",
                                }}
                            >
                                Check Answer
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Result Phase */}
            {phase === "result" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: "center", padding: "40px 20px" }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        style={{ fontSize: 72, marginBottom: 16 }}
                    >
                        {scorePercent >= 80 ? "🏆" : scorePercent >= 60 ? "⭐" : "📚"}
                    </motion.div>

                    <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
                        {scorePercent >= 80
                            ? "Amazing!"
                            : scorePercent >= 60
                                ? "Good Job!"
                                : "Keep Practicing!"}
                    </h1>

                    <p className="text-muted" style={{ fontSize: 18, marginBottom: 32 }}>
                        You got{" "}
                        <strong className="text-green">
                            {finalScore} out of {totalQuestions}
                        </strong>{" "}
                        questions right
                    </p>

                    <div
                        className="stats-grid"
                        style={{ maxWidth: 450, margin: "0 auto 32px" }}
                    >
                        <div className="stat-card">
                            <div
                                className="stat-card-value"
                                style={{
                                    color:
                                        scorePercent >= 80
                                            ? "var(--primary-green)"
                                            : scorePercent >= 60
                                                ? "var(--primary-orange)"
                                                : "var(--primary-red)",
                                }}
                            >
                                {scorePercent}%
                            </div>
                            <div className="stat-card-label">Score</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value text-green">{finalScore}</div>
                            <div className="stat-card-label">Correct</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value text-red">
                                {totalQuestions - finalScore}
                            </div>
                            <div className="stat-card-label">Wrong</div>
                        </div>
                    </div>

                    <motion.div
                        className="card"
                        style={{
                            maxWidth: 450,
                            margin: "0 auto 32px",
                            padding: 24,
                            textAlign: "left",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy size={20} style={{ color: "var(--primary-orange)" }} />
                            <span className="font-bold">XP Earned</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted">Correct answers</span>
                            <span className="font-bold text-green">+{finalScore * 10} XP</span>
                        </div>
                        {scorePercent >= 80 && (
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-muted">Score 80%+ bonus</span>
                                <span className="font-bold text-green">+25 XP</span>
                            </div>
                        )}
                        {scorePercent === 100 && (
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-muted">Perfect score! 🎉</span>
                                <span className="font-bold text-green">+50 XP</span>
                            </div>
                        )}
                        <div
                            style={{
                                borderTop: "1px solid var(--border-subtle)",
                                marginTop: 12,
                                paddingTop: 12,
                            }}
                            className="flex items-center justify-between"
                        >
                            <span className="font-bold">Total</span>
                            <span className="font-extrabold text-green" style={{ fontSize: 20 }}>
                                +
                                {finalScore * 10 +
                                    (scorePercent >= 80 ? 25 : 0) +
                                    (scorePercent === 100 ? 50 : 0)}{" "}
                                XP
                            </span>
                        </div>
                    </motion.div>

                    <div className="flex items-center justify-between gap-3" style={{ justifyContent: "center" }}>
                        <button className="btn btn-primary" onClick={startExam}>
                            <RotateCcw size={16} /> Try Again
                        </button>
                        <Link href="/dashboard" className="btn btn-outline">
                            <Home size={16} /> Dashboard
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
