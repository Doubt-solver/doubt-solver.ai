"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/subjects", label: "Subjects", icon: BookOpen },
    { href: "/dashboard/exam", label: "Take Exam", icon: FileQuestion },
    { href: "/dashboard/doubts", label: "Ask Doubt", icon: MessageCircleQuestion },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/dashboard/badges", label: "Badges", icon: Award },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface UserProfile {
    name: string;
    level: number;
    xp: number;
}

const levelNames: Record<number, string> = {
    1: "Beginner",
    2: "Learner",
    3: "Student",
    4: "Scholar",
    5: "Expert",
    6: "Master",
    7: "Grandmaster",
    8: "Legend",
    9: "Champion",
    10: "Genius",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile>({
        name: "Student",
        level: 1,
        xp: 0,
    });

    const supabase = createClient();

    useEffect(() => {
        const loadProfile = async () => {
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
                    // Use auth metadata as fallback
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
        };

        loadProfile();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <GraduationCap size={22} color="white" />
                    </div>
                    <Link href="/" className="sidebar-logo-text" style={{ textDecoration: "none" }}>
                        DoubtSolver.ai
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href ? "active" : ""
                                }`}
                        >
                            <item.icon size={20} className="sidebar-link-icon" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{profile.name}</div>
                        <div className="sidebar-user-level">
                            Level {profile.level} · {levelNames[profile.level] || "Scholar"}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: 6,
                            borderRadius: "var(--radius-sm)",
                            marginLeft: "auto",
                        }}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">{children}</main>
        </div>
    );
}
