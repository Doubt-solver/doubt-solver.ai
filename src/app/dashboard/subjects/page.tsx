"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Calculator,
    FlaskConical,
    BookOpen,
    Globe,
    Laptop,
    ArrowRight,
    Zap,
    Loader2,
} from "lucide-react";

// Static topic definitions per subject (CBSE Class 10)
const SUBJECT_DEFINITIONS = [
    {
        name: "Mathematics",
        icon: <Calculator size={28} />,
        color: "#2563EB",
        bg: "#EFF6FF",
        topics: [
            "Number Systems", "Algebra", "Geometry", "Trigonometry", "Statistics",
            "Probability", "Mensuration", "Coordinate Geometry", "Quadratic Equations",
            "Arithmetic Progressions", "Surface Area & Volume", "Polynomials",
        ],
    },
    {
        name: "Science",
        icon: <FlaskConical size={28} />,
        color: "#16A34A",
        bg: "#F0FDF4",
        topics: [
            "Chemical Reactions", "Acids, Bases & Salts", "Metals & Non-metals",
            "Carbon Compounds", "Life Processes", "Heredity & Evolution", "Light",
            "Electricity", "Magnetic Effects", "Sources of Energy", "The Human Eye",
            "Control & Coordination", "Environment", "Classification of Elements", "Reproduction",
        ],
    },
    {
        name: "English",
        icon: <BookOpen size={28} />,
        color: "#7C3AED",
        bg: "#F5F3FF",
        topics: [
            "Grammar — Tenses", "Grammar — Modals", "Comprehension",
            "Writing — Letter", "Writing — Essay", "Literature — Prose",
            "Literature — Poetry", "Vocabulary", "Grammar — Voice", "Grammar — Reported Speech",
        ],
    },
    {
        name: "Social Science",
        icon: <Globe size={28} />,
        color: "#D97706",
        bg: "#FEF3E2",
        topics: [
            "History — French Revolution", "History — Nazism", "History — Indian National Movement",
            "Geography — Resources", "Geography — Agriculture", "Geography — Manufacturing",
            "Civics — Democracy", "Civics — Power Sharing", "Economics — Development",
            "Economics — Money & Credit", "Economics — Sectors", "Economics — Globalisation",
            "Geography — Minerals & Energy", "Civics — Political Parties",
        ],
    },
    {
        name: "Computer Science",
        icon: <Laptop size={28} />,
        color: "#DC2626",
        bg: "#FEF2F2",
        topics: [
            "Networking Concepts", "HTML & CSS", "Python Basics", "Python Functions",
            "Databases & SQL", "Cyber Safety", "Lists & Dictionaries", "File Handling",
        ],
    },
];

export default function SubjectsPage() {
    const [topicProgress, setTopicProgress] = useState<Record<string, Record<string, number>>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/data?section=topic-progress")
            .then((r) => r.json())
            .then((d) => setTopicProgress(d.topics ?? {}))
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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>📚 Subjects</h1>
                <p>Choose a subject and topic to study or practice</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {SUBJECT_DEFINITIONS.map((subject, si) => {
                    const subjectTopicProgress = topicProgress[subject.name] ?? {};
                    const topicsWithProgress = subject.topics.map((name) => ({
                        name,
                        progress: subjectTopicProgress[name] ?? 0,
                    }));

                    const completedTopics = topicsWithProgress.filter((t) => t.progress > 0).length;
                    const totalProgress =
                        topicsWithProgress.length > 0
                            ? Math.round(topicsWithProgress.reduce((s, t) => s + t.progress, 0) / topicsWithProgress.length)
                            : 0;

                    return (
                        <motion.div
                            key={si}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: si * 0.1 }}
                        >
                            {/* Subject Header */}
                            <div
                                className="card"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    marginBottom: 12,
                                    borderColor: `${subject.color}33`,
                                }}
                            >
                                <div
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: "var(--radius-md)",
                                        background: subject.bg,
                                        color: subject.color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {subject.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 18 }}>{subject.name}</div>
                                    <div className="text-sm text-muted">
                                        {subject.topics.length} topics · {completedTopics} practiced · {totalProgress}% avg
                                    </div>
                                </div>
                                <div style={{ width: 120 }}>
                                    <div className="xp-bar-container" style={{ height: 8 }}>
                                        <div
                                            className="xp-bar-fill"
                                            style={{ width: `${totalProgress}%`, background: subject.color }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Topics Grid */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                                    gap: 10,
                                }}
                            >
                                {topicsWithProgress.map((topic, ti) => (
                                    <motion.div
                                        key={ti}
                                        className="card"
                                        style={{
                                            padding: 14,
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                        whileHover={{ scale: 1.02, borderColor: subject.color }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{topic.name}</div>
                                        <div className="xp-bar-container" style={{ height: 6 }}>
                                            <div
                                                className="xp-bar-fill"
                                                style={{
                                                    width: `${topic.progress}%`,
                                                    background: subject.color,
                                                }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                fontSize: 12,
                                            }}
                                        >
                                            <span className="text-muted">{topic.progress > 0 ? `${topic.progress}%` : "Not started"}</span>
                                            <Link
                                                href={`/dashboard/exam?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(topic.name)}`}
                                                style={{
                                                    color: subject.color,
                                                    textDecoration: "none",
                                                    fontWeight: 700,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                }}
                                            >
                                                Practice <ArrowRight size={12} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick CTA */}
            <div className="mt-8 mb-6" style={{ textAlign: "center" }}>
                <Link href="/dashboard/exam" className="btn btn-primary btn-lg">
                    <Zap size={20} /> Take a Quick Exam
                </Link>
            </div>
        </motion.div>
    );
}
