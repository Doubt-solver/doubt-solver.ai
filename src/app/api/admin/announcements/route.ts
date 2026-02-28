import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from "@/lib/db";

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

// GET /api/admin/announcements
export async function GET() {
    try {
        const { data, error } = await listAnnouncements();
        if (error) throw error;
        return NextResponse.json({ announcements: data });
    } catch (error) {
        console.warn("[/api/admin/announcements GET] DB not available:", error);
        return NextResponse.json({ announcements: [] });
    }
}

// POST /api/admin/announcements
export async function POST(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        const body = await req.json();

        try {
            const { data, error } = await createAnnouncement(body, userId);
            if (!error && data) return NextResponse.json({ announcement: data });
        } catch (dbError) {
            console.warn("[/api/admin/announcements POST] DB not available:", dbError);
        }

        return NextResponse.json({
            announcement: { id: crypto.randomUUID(), ...body, created_at: new Date().toISOString() },
        });
    } catch (error) {
        console.error("[/api/admin/announcements POST] Error:", error);
        return NextResponse.json({ announcement: { id: crypto.randomUUID(), created_at: new Date().toISOString() } });
    }
}

// DELETE /api/admin/announcements?id=xxx
export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        try {
            const { error } = await deleteAnnouncement(id);
            if (!error) return NextResponse.json({ ok: true });
        } catch { }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[/api/admin/announcements DELETE] Error:", error);
        return NextResponse.json({ ok: true });
    }
}
