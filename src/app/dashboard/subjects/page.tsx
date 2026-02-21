"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Calculator,
    FlaskConical,
    BookOpen,
    Globe,
    Laptop,
    ArrowRight,
    Zap,
} from "lucide-react";

const subjects = [
    {
        name: "Mathematics",
        icon: <Calculator size={28} />,
        color: "#1CB0F6",
        bg: "rgba(28, 176, 246, 0.15)",
        topics: [
            { name: "Number Systems", progress: 80 },
            { name: "Algebra", progress: 55 },
            { name: "Geometry", progress: 40 },
            { name: "Trigonometry", progress: 25 },
            { name: "Statistics", progress: 60 },
            { name: "Probability", progress: 10 },
            { name: "Mensuration", progress: 45 },
            { name: "Coordinate Geometry", progress: 30 },
            { name: "Quadratic Equations", progress: 70 },
            { name: "Arithmetic Progressions", progress: 15 },
            { name: "Surface Area & Volume", progress: 35 },
            { name: "Polynomials", progress: 90 },
        ],
        totalProgress: 45,
    },
    {
        name: "Science",
        icon: <FlaskConical size={28} />,
        color: "#58CC02",
        bg: "rgba(88, 204, 2, 0.15)",
        topics: [
            { name: "Chemical Reactions", progress: 65 },
            { name: "Acids, Bases & Salts", progress: 40 },
            { name: "Metals & Non-metals", progress: 30 },
            { name: "Carbon Compounds", progress: 20 },
            { name: "Life Processes", progress: 50 },
            { name: "Heredity & Evolution", progress: 10 },
            { name: "Light", progress: 45 },
            { name: "Electricity", progress: 35 },
            { name: "Magnetic Effects", progress: 25 },
            { name: "Sources of Energy", progress: 15 },
            { name: "The Human Eye", progress: 55 },
            { name: "Control & Coordination", progress: 20 },
            { name: "Environment", progress: 5 },
            { name: "Classification of Elements", progress: 40 },
            { name: "Reproduction", progress: 30 },
        ],
        totalProgress: 32,
    },
    {
        name: "English",
        icon: <BookOpen size={28} />,
        color: "#CE82FF",
        bg: "rgba(206, 130, 255, 0.15)",
        topics: [
            { name: "Grammar — Tenses", progress: 90 },
            { name: "Grammar — Modals", progress: 75 },
            { name: "Comprehension", progress: 60 },
            { name: "Writing — Letter", progress: 50 },
            { name: "Writing — Essay", progress: 40 },
            { name: "Literature — Prose", progress: 70 },
            { name: "Literature — Poetry", progress: 55 },
            { name: "Vocabulary", progress: 85 },
            { name: "Grammar — Voice", progress: 65 },
            { name: "Grammar — Reported Speech", progress: 45 },
        ],
        totalProgress: 68,
    },
    {
        name: "Social Science",
        icon: <Globe size={28} />,
        color: "#FF9600",
        bg: "rgba(255, 150, 0, 0.15)",
        topics: [
            { name: "History — French Revolution", progress: 30 },
            { name: "History — Nazism", progress: 20 },
            { name: "History — Indian National Movement", progress: 25 },
            { name: "Geography — Resources", progress: 15 },
            { name: "Geography — Agriculture", progress: 10 },
            { name: "Geography — Manufacturing", progress: 5 },
            { name: "Civics — Democracy", progress: 35 },
            { name: "Civics — Power Sharing", progress: 20 },
            { name: "Economics — Development", progress: 30 },
            { name: "Economics — Money & Credit", progress: 10 },
            { name: "Economics — Sectors", progress: 25 },
            { name: "Economics — Globalisation", progress: 15 },
            { name: "Geography — Minerals & Energy", progress: 20 },
            { name: "Civics — Political Parties", progress: 10 },
        ],
        totalProgress: 20,
    },
    {
        name: "Computer Science",
        icon: <Laptop size={28} />,
        color: "#FF4B4B",
        bg: "rgba(255, 75, 75, 0.15)",
        topics: [
            { name: "Networking Concepts", progress: 70 },
            { name: "HTML & CSS", progress: 85 },
            { name: "Python Basics", progress: 60 },
            { name: "Python Functions", progress: 45 },
            { name: "Databases & SQL", progress: 50 },
            { name: "Cyber Safety", progress: 80 },
            { name: "Lists & Dictionaries", progress: 35 },
            { name: "File Handling", progress: 20 },
        ],
        totalProgress: 55,
    },
];

export default function SubjectsPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header">
                <h1>📚 Subjects</h1>
                <p>Choose a subject and topic to study or practice</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {subjects.map((subject, si) => (
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
                                    {subject.topics.length} topics · {subject.totalProgress}% complete
                                </div>
                            </div>
                            <div style={{ width: 120 }}>
                                <div className="xp-bar-container" style={{ height: 8 }}>
                                    <div
                                        className="xp-bar-fill"
                                        style={{
                                            width: `${subject.totalProgress}%`,
                                            background: subject.color,
                                        }}
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
                            {subject.topics.map((topic, ti) => (
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
                                        <span className="text-muted">{topic.progress}%</span>
                                        <Link
                                            href="/dashboard/exam"
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
                ))}
            </div>

            {/* Sticky Footer CTA */}
            <div className="mt-8 mb-6" style={{ textAlign: "center" }}>
                <Link href="/dashboard/exam" className="btn btn-primary btn-lg">
                    <Zap size={20} /> Take a Quick Exam
                </Link>
            </div>
        </motion.div>
    );
}
