import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listReports, updateReportStatus } from "@/lib/db";

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

// GET /api/admin/reports?status=open
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const status = url.searchParams.get("status") ?? undefined;
        const { data, error } = await listReports(status);
        if (error) throw error;
        return NextResponse.json({ reports: data });
    } catch (error) {
        console.warn("[/api/admin/reports GET] DB not available:", error);
        return NextResponse.json({ reports: [] });
    }
}

// PATCH /api/admin/reports — update status
export async function PATCH(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        const body = await req.json();
        const { id, status, admin_notes } = body;
        if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

        try {
            const { data, error } = await updateReportStatus(id, status, userId, admin_notes);
            if (!error && data) return NextResponse.json({ report: data });
        } catch (dbError) {
            console.warn("[/api/admin/reports PATCH] DB not available:", dbError);
        }

        return NextResponse.json({ report: { id, status } });
    } catch (error) {
        console.error("[/api/admin/reports PATCH] Error:", error);
        return NextResponse.json({ ok: true });
    }
}
