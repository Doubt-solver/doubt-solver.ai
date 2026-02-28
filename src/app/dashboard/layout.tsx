"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap,
    LayoutDashboard,
    BookOpen,
    FileQuestion,
    Trophy,
    Award,
    MessageCircleQuestion,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Bookmark,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/subjects", label: "Subjects", icon: BookOpen },
    { href: "/dashboard/exam", label: "Exam", icon: FileQuestion },
    { href: "/dashboard/doubts", label: "Doubts", icon: MessageCircleQuestion },
    { href: "/dashboard/revisions", label: "Revisions", icon: Bookmark },
    { href: "/dashboard/leaderboard", label: "Rank", icon: Trophy },
    { href: "/dashboard/badges", label: "Badges", icon: Award },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface UserProfile {
    name: string;
    level: number;
    xp: number;
}

interface Announcement {
    id: string;
    title: string;
    body: string;
    is_pinned: boolean;
    created_at: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        name: "Student",
        level: 1,
        xp: 0,
    });
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [showAnnouncements, setShowAnnouncements] = useState(false);
    const announcementsRef = useRef<HTMLDivElement>(null);

    const supabase = createClient();

    useEffect(() => {
        fetch("/api/user/data?section=announcements")
            .then((r) => r.json())
            .then((d) => {
                if (d.announcements) setAnnouncements(d.announcements);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (announcementsRef.current && !announcementsRef.current.contains(event.target as Node)) {
                setShowAnnouncements(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("name, level, xp")
                        .eq("id", user.id)
                        .single();

                    if (profileData) {
                        setProfile(profileData);
                    } else {
                        setProfile({
                            name:
                                user.user_metadata?.full_name ||
                                user.user_metadata?.name ||
                                user.email?.split("@")[0] ||
                                "Student",
                            level: 1,
                            xp: 0,
                        });
                    }
                }
            } catch {
                // Auth disabled
            }
        };

        loadProfile();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await fetch("/api/auth/signout", { method: "POST" });
        router.push("/auth/login");
    };

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="app-layout">
            {/* ─── Top Navbar (Desktop) ─── */}
            <nav className="top-navbar">
                <Link href="/" className="top-navbar-logo" style={{ textDecoration: "none" }}>
                    <div className="top-navbar-logo-icon">
                        <GraduationCap size={20} color="white" />
                    </div>
                    <span className="top-navbar-logo-text">DoubtSolver.ai</span>
                </Link>

                <div className="top-navbar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`top-navbar-link ${pathname === item.href ? "active" : ""}`}
                        >
                            <item.icon size={16} className="top-navbar-link-icon" />
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="top-navbar-right">
                    <div ref={announcementsRef} style={{ position: "relative" }}>
                        <button
                            className="top-navbar-icon-btn"
                            title="Notifications"
                            onClick={() => setShowAnnouncements(!showAnnouncements)}
                        >
                            <Bell size={18} />
                            {announcements.length > 0 && (
                                <span style={{
                                    position: "absolute", top: 8, right: 8,
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: "#EF4444", border: "2px solid white"
                                }} />
                            )}
                        </button>

                        <AnimatePresence>
                            {showAnnouncements && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: "absolute", top: 48, right: 0,
                                        width: 320, background: "white",
                                        borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                        border: "1px solid var(--border-subtle)",
                                        zIndex: 200, overflow: "hidden",
                                        transformOrigin: "top right"
                                    }}
                                >
                                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Announcements</h3>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: 99 }}>
                                            {announcements.length}
                                        </span>
                                    </div>
                                    <div style={{ maxHeight: 360, overflowY: "auto" }}>
                                        {announcements.length === 0 ? (
                                            <div style={{ padding: 32, textAlign: "center", color: "var(--text-tertiary)" }}>
                                                <Bell size={24} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                                                <div style={{ fontSize: 14, fontWeight: 500 }}>No announcements yet</div>
                                                <div style={{ fontSize: 13, marginTop: 4 }}>You&apos;re all caught up!</div>
                                            </div>
                                        ) : (
                                            announcements.map((ann, idx) => (
                                                <div
                                                    key={ann.id}
                                                    style={{
                                                        padding: 16,
                                                        borderBottom: idx === announcements.length - 1 ? "none" : "1px solid var(--border-subtle)",
                                                        background: ann.is_pinned ? "#F8FAFC" : "white",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                                                        {ann.is_pinned && <span style={{ fontSize: 14, marginTop: 2 }}>📌</span>}
                                                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.4 }}>
                                                            {ann.title}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                                        {ann.body}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 8, fontWeight: 500 }}>
                                                        {new Date(ann.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        className="sidebar-avatar"
                        title={profile.name}
                        style={{ cursor: "pointer", border: "none" }}
                        onClick={() => router.push("/dashboard/settings")}
                    >
                        {initials}
                    </button>
                </div>
            </nav>

            {/* ─── Mobile Header ─── */}
            <header className="mobile-header">
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="mobile-header-logo">
                    <div className="sidebar-logo-icon" style={{ width: 28, height: 28 }}>
                        <GraduationCap size={16} color="white" />
                    </div>
                    <span className="sidebar-logo-text" style={{ fontSize: 16 }}>
                        DoubtSolver.ai
                    </span>
                </div>
                <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                    {initials}
                </div>
            </header>

            {/* ─── Mobile Menu Overlay ─── */}
            {mobileMenuOpen && (
                <>
                    <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
                    <div
                        style={{
                            position: "fixed",
                            top: 56,
                            left: 0,
                            right: 0,
                            background: "var(--bg-secondary)",
                            borderBottom: "1px solid var(--border-subtle)",
                            zIndex: 150,
                            padding: "8px 16px 16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        }}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 16px",
                                    borderRadius: "var(--radius-md)",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    color: pathname === item.href ? "white" : "var(--text-secondary)",
                                    background: pathname === item.href ? "var(--text-primary)" : "transparent",
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        ))}
                        <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 8, paddingTop: 8 }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 16px",
                                    width: "100%",
                                    background: "none",
                                    border: "none",
                                    color: "var(--primary-red)",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    fontFamily: "inherit",
                                    cursor: "pointer",
                                }}
                            >
                                <LogOut size={20} />
                                Sign out
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ─── Main Content ─── */}
            <main className="main-content">{children}</main>
        </div>
    );
}
