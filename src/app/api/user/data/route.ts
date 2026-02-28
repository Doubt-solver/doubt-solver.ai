import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    getUserStats,
    getRecentExams,
    getSubjectProgress,
    getTopicProgress,
    getWeeklyXP,
    getLeaderboard,
    getUserBadges,
    evaluateAndAwardBadges,
    BADGE_DEFINITIONS,
    getUserProfile,
    listAnnouncements,
} from "@/lib/db";

// Mock user ID for when auth is disabled
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

async function getCurrentUserId() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user?.id ?? MOCK_USER_ID;
    } catch {
        return MOCK_USER_ID;
    }
}

export async function GET(request: Request) {
    try {
        const userId = await getCurrentUserId();
        const url = new URL(request.url);
        const section = url.searchParams.get("section");

        switch (section) {
            case "profile": {
                const profile = await getUserProfile(userId);
                // Return mock profile if no real profile exists
                return NextResponse.json({
                    profile: profile ?? { name: "Student", grade: "Class 10", board: "CBSE", xp: 0, level: 1, streak: 0 },
                });
            }

            case "stats": {
                const stats = await getUserStats(userId);
                return NextResponse.json({ stats });
            }

            case "recent-exams": {
                const limit = parseInt(url.searchParams.get("limit") || "5");
                const exams = await getRecentExams(userId, limit);
                return NextResponse.json({ exams });
            }

            case "subject-progress": {
                const progress = await getSubjectProgress(userId);
                return NextResponse.json({ progress });
            }

            case "topic-progress": {
                const topics = await getTopicProgress(userId);
                return NextResponse.json({ topics });
            }

            case "weekly-xp": {
                const weekly = await getWeeklyXP(userId);
                return NextResponse.json({ weekly });
            }

            case "leaderboard": {
                const limit = parseInt(url.searchParams.get("limit") || "10");
                const leaders = await getLeaderboard(limit);
                return NextResponse.json({
                    leaders,
                    currentUserId: userId,
                });
            }

            case "badges": {
                try {
                    const newBadges = await evaluateAndAwardBadges(userId);
                    const earned = await getUserBadges(userId);
                    return NextResponse.json({
                        definitions: BADGE_DEFINITIONS,
                        earned,
                        newBadges,
                    });
                } catch {
                    // If tables don't exist, return empty badges
                    return NextResponse.json({
                        definitions: BADGE_DEFINITIONS,
                        earned: [],
                        newBadges: [],
                    });
                }
            }

            case "announcements": {
                const { data } = await listAnnouncements();
                return NextResponse.json({ announcements: data });
            }

            case "dashboard": {
                const [stats, recentExams, subjectProgress, leaderboard] = await Promise.all([
                    getUserStats(userId),
                    getRecentExams(userId, 3),
                    getSubjectProgress(userId),
                    getLeaderboard(5),
                ]);
                return NextResponse.json({
                    stats,
                    recentExams,
                    subjectProgress,
                    leaderboard,
                    currentUserId: userId,
                });
            }

            case "analytics": {
                const [stats, weeklyXP, subjectProgress, recentExams] = await Promise.all([
                    getUserStats(userId),
                    getWeeklyXP(userId),
                    getSubjectProgress(userId),
                    getRecentExams(userId, 50),
                ]);
                return NextResponse.json({
                    stats,
                    weeklyXP,
                    subjectProgress,
                    recentExams,
                });
            }

            default:
                return NextResponse.json({ error: "Invalid section" }, { status: 400 });
        }
    } catch (error) {
        console.error("[/api/user/data] Error:", error);
        // Return safe defaults on any error (e.g. tables don't exist)
        const url = new URL(request.url);
        const section = url.searchParams.get("section");

        if (section === "dashboard") {
            return NextResponse.json({
                stats: { xp: 0, level: 1, streak: 0, examCount: 0, avgScore: 0 },
                recentExams: [],
                subjectProgress: [],
                leaderboard: [],
                currentUserId: MOCK_USER_ID,
            });
        }
        if (section === "profile") {
            return NextResponse.json({
                profile: { name: "Student", grade: "Class 10", board: "CBSE", xp: 0, level: 1, streak: 0 },
            });
        }
        if (section === "badges") {
            return NextResponse.json({ definitions: BADGE_DEFINITIONS, earned: [], newBadges: [] });
        }
        if (section === "announcements") {
            return NextResponse.json({ announcements: [] });
        }

        return NextResponse.json({
            error: "Failed to load data",
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
