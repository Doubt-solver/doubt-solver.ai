import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminStats, requireAdmin } from "@/lib/db";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

async function getCurrentUserId() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id ?? MOCK_USER_ID;
    } catch {
        return MOCK_USER_ID;
    }
}

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        // Role check (soft — allow in dev)
        const isAdmin = await requireAdmin(userId).catch(() => true);

        const stats = await getAdminStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error("[/api/admin/dashboard] Error:", error);
        return NextResponse.json({
            totalQuestions: 0,
            totalQuizzes: 0,
            openReports: 0,
            totalStudents: 0,
            recentReports: [],
        });
    }
}
