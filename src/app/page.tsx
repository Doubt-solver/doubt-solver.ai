"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  BookOpen,
  Target,
  Trophy,
  Sparkles,
  ArrowRight,
  Zap,
  BarChart3,
  MessageCircleQuestion,
  GraduationCap,
} from "lucide-react";

import type { Easing } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as Easing },
  }),
};

const features = [
  {
    icon: <Brain size={28} />,
    title: "AI-Powered Questions",
    desc: "Our AI generates fresh, syllabus-aligned MCQs and questions every time. No repeated papers — ever.",
    color: "bg-green",
    textColor: "text-green",
  },
  {
    icon: <Target size={28} />,
    title: "Self-Assessment Exams",
    desc: "Take timed exams that mimic real tests. Get instant scores and detailed performance analytics.",
    color: "bg-blue",
    textColor: "text-blue",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Smart Recommendations",
    desc: "AI analyzes your weak spots and creates a personalized study plan to boost your scores.",
    color: "bg-purple",
    textColor: "text-purple",
  },
  {
    icon: <BookOpen size={28} />,
    title: "Study Material",
    desc: "AI-generated summaries, flashcards, and key points from your textbooks — ready when you are.",
    color: "bg-orange",
    textColor: "text-orange",
  },
  {
    icon: <MessageCircleQuestion size={28} />,
    title: "Doubt Solver",
    desc: "Ask any doubt and get textbook-accurate answers powered by RAG. Like having a tutor 24/7.",
    color: "bg-green",
    textColor: "text-green",
  },
  {
    icon: <Trophy size={28} />,
    title: "Gamified Learning",
    desc: "Earn XP, maintain streaks, climb leaderboards, and unlock badges. Learning has never been this fun!",
    color: "bg-blue",
    textColor: "text-blue",
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Background Orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={22} color="white" />
          </div>
          <span className="sidebar-logo-text">DoubtSolver.ai</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">
            Features
          </a>
          <a href="#how-it-works" className="landing-nav-link">
            How it Works
          </a>
          <Link href="/auth/onboarding" className="btn btn-primary btn-sm">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <motion.div
          className="landing-hero-content"
          initial="hidden"
          animate="visible"
        >
          <motion.div className="landing-hero-badge" variants={fadeUp} custom={0}>
            <Sparkles size={16} />
            AI-Powered Learning Platform
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1}>
            Ace your exams with{" "}
            <span className="highlight-green">AI-powered</span> practice &{" "}
            <span className="highlight-blue">smart recommendations</span>
          </motion.h1>

          <motion.p className="landing-hero-desc" variants={fadeUp} custom={2}>
            The fun way to prepare for school exams. Take AI-generated tests,
            track your progress, get personalized study plans, and compete with
            friends — all powered by cutting-edge AI.
          </motion.p>

          <motion.div
            className="landing-hero-buttons"
            variants={fadeUp}
            custom={3}
          >
            <Link href="/auth/onboarding" className="btn btn-primary btn-lg">
              <Zap size={20} />
              Start Learning Free
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">
              See How It Works
            </a>
          </motion.div>

          <motion.div
            className="landing-hero-stats"
            variants={fadeUp}
            custom={4}
          >
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-value">10K+</div>
              <div className="landing-hero-stat-label">Questions Generated</div>
            </div>
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-value">500+</div>
              <div className="landing-hero-stat-label">Active Students</div>
            </div>
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-value">95%</div>
              <div className="landing-hero-stat-label">Improvement Rate</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="landing-section" id="features">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="landing-section-title">
            Everything you need to{" "}
            <span className="highlight-green">crush</span> your exams
          </h2>
          <p className="landing-section-desc">
            Designed for CBSE, ICSE & State Board students from Class 6 to 12.
            Every feature is built to make learning addictive.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className={`feature-card-icon ${feature.color}`}>
                <span className={feature.textColor}>{feature.icon}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section" id="how-it-works">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="landing-section-title">
            How does it <span className="highlight-blue">work?</span>
          </h2>
          <p className="landing-section-desc">
            Simple as 1-2-3. No complicated setup, no boring lectures.
          </p>
        </motion.div>

        <div className="features-grid">
          {[
            {
              step: "1",
              title: "Choose your subject",
              desc: "Pick your grade, board, and the subject you want to practice. We support all major boards.",
              icon: "📚",
            },
            {
              step: "2",
              title: "Take AI-generated exams",
              desc: "Our AI creates unique question sets based on your syllabus. Take timed tests and get instant scores.",
              icon: "📝",
            },
            {
              step: "3",
              title: "Level up with recommendations",
              desc: "AI identifies your weak areas and recommends exactly what to study next. Watch your scores soar!",
              icon: "🚀",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>
            Ready to <span className="highlight-green">ace</span> your next
            exam?
          </h2>
          <p>
            Join thousands of students who are studying smarter, not harder.
          </p>
          <Link href="/auth/onboarding" className="btn btn-primary btn-lg">
            <Zap size={20} />
            Start Learning — It&apos;s Free!
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          © {new Date().getFullYear()} DoubtSolver.ai — Built with 💚 for
          students who dream big.
        </p>
      </footer>
    </div>
  );
}
