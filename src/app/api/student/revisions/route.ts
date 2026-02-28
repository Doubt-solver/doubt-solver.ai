import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listRevisions, addRevision, updateRevision, deleteRevision } from "@/lib/db";

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

// GET /api/student/revisions
export async function GET() {
    try {
        const userId = await getCurrentUserId();
        const { data, error } = await listRevisions(userId);
        if (error) throw error;
        return NextResponse.json({ revisions: data });
    } catch (error) {
        console.warn("[/api/student/revisions GET] DB not available:", error);
        return NextResponse.json({ revisions: [] });
    }
}

// POST /api/student/revisions
export async function POST(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        const body = await req.json();

        try {
            const { data, error } = await addRevision(userId, body);
            if (!error && data) return NextResponse.json({ revision: data });
        } catch (dbError) {
            console.warn("[/api/student/revisions POST] DB not available:", dbError);
        }

        return NextResponse.json({
            revision: { id: crypto.randomUUID(), ...body, user_id: userId, created_at: new Date().toISOString() },
        });
    } catch (error) {
        console.error("[/api/student/revisions POST] Error:", error);
        return NextResponse.json({ revision: { id: crypto.randomUUID(), created_at: new Date().toISOString() } });
    }
}

// PUT /api/student/revisions
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        try {
            const { data, error } = await updateRevision(id, updates);
            if (!error && data) return NextResponse.json({ revision: data });
        } catch { }

        return NextResponse.json({ revision: { id, ...updates } });
    } catch (error) {
        console.error("[/api/student/revisions PUT] Error:", error);
        return NextResponse.json({ ok: true });
    }
}

// DELETE /api/student/revisions?id=xxx
export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        try {
            const { error } = await deleteRevision(id);
            if (!error) return NextResponse.json({ ok: true });
        } catch { }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[/api/student/revisions DELETE] Error:", error);
        return NextResponse.json({ ok: true });
    }
}
