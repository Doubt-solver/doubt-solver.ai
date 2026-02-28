"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Megaphone,
    Star,
    AlertTriangle,
    LogOut,
    Menu,
    X,
    ChevronLeft,
} from "lucide-react";

const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/questions", label: "Questions", icon: BookOpen },
    { href: "/admin/quizzes", label: "Quizzes", icon: ClipboardList },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/potd", label: "Problem of the Day", icon: Star },
    { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/data?section=profile")
            .then((r) => r.json())
            .then((d) => {
                const userRole = d.profile?.role ?? "student";
                setRole(userRole);
                // For now, allow access (auth disabled) — in production, redirect students
                // if (userRole === "student") router.push("/dashboard");
            })
            .catch(() => setRole("admin")) // fallback for dev
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#FBF7F4" }}>
                <div style={{ fontSize: 16, color: "#999" }}>Loading admin panel...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#FBF7F4" }}>
            {/* Top Navbar */}
            <nav style={{
                position: "sticky",
                top: 0,
                height: 64,
                background: "white",
                borderBottom: "1px solid #EDE8E3",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
                zIndex: 50,
            }}>
                {/* Left: Back + Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Link
                        href="/dashboard"
                        style={{
                            display: "flex", alignItems: "center", gap: 4,
                            color: "#999", textDecoration: "none", fontSize: 14, fontWeight: 600,
                        }}
                    >
                        <ChevronLeft size={18} /> Back to App
                    </Link>
                    <div style={{ width: 1, height: 24, background: "#EDE8E3" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            width: 32, height: 32,
                            borderRadius: 8,
                            background: "#1A1A1A",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: 14, fontWeight: 800,
                        }}>
                            A
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 16 }}>Admin Panel</span>
                    </div>
                </div>

                {/* Desktop Nav */}
                <div className="desktop-only" style={{ display: "flex", gap: 4 }}>
                    {adminNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "8px 14px",
                                    borderRadius: 999,
                                    background: isActive ? "#1A1A1A" : "transparent",
                                    color: isActive ? "white" : "#666",
                                    textDecoration: "none",
                                    fontSize: 13,
                                    fontWeight: isActive ? 700 : 600,
                                    transition: "all 150ms ease",
                                }}
                            >
                                <Icon size={15} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="mobile-only"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        display: "none", padding: 4,
                    }}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Nav Dropdown */}
            {mobileMenuOpen && (
                <div style={{
                    position: "fixed", top: 64, left: 0, right: 0,
                    background: "white", borderBottom: "1px solid #EDE8E3",
                    padding: 16, zIndex: 49,
                    display: "flex", flexDirection: "column", gap: 4,
                }}>
                    {adminNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "12px 16px", borderRadius: 12,
                                    background: isActive ? "#F5F0EC" : "transparent",
                                    color: "#1A1A1A", textDecoration: "none",
                                    fontSize: 15, fontWeight: isActive ? 700 : 500,
                                }}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Content */}
            <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
                {children}
            </main>

            <style jsx>{`
                @media (min-width: 769px) {
                    .mobile-only { display: none !important; }
                }
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }
                }
            `}</style>
        </div>
    );
}
