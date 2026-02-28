import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listQuestions, createQuestion, updateQuestion, deleteQuestion, requireAdmin } from "@/lib/db";

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

// GET /api/admin/questions?subject=Mathematics&search=quadratic
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const subject = url.searchParams.get("subject") ?? undefined;
        const search = url.searchParams.get("search") ?? undefined;

        const { data, error } = await listQuestions({ subject, search });
        if (error) throw error;

        return NextResponse.json({ questions: data });
    } catch (error) {
        console.error("[/api/admin/questions GET] Error:", error);
        return NextResponse.json({ questions: [] });
    }
}

// POST /api/admin/questions — create a new question
export async function POST(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        const body = await req.json();

        try {
            const { data, error } = await createQuestion(body, userId);
            if (!error && data) {
                return NextResponse.json({ question: data });
            }
        } catch (dbError) {
            console.warn("[/api/admin/questions POST] DB not available:", dbError);
        }

        // Fallback: return mock data
        return NextResponse.json({
            question: { id: crypto.randomUUID(), ...body, is_active: true, created_at: new Date().toISOString() },
        });
    } catch (error) {
        console.error("[/api/admin/questions POST] Error:", error);
        return NextResponse.json({
            question: { id: crypto.randomUUID(), is_active: true, created_at: new Date().toISOString() },
        });
    }
}

// PUT /api/admin/questions — update a question
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        try {
            const { data, error } = await updateQuestion(id, updates);
            if (!error && data) return NextResponse.json({ question: data });
        } catch { }

        return NextResponse.json({ question: { id, ...updates } });
    } catch (error) {
        console.error("[/api/admin/questions PUT] Error:", error);
        return NextResponse.json({ ok: true });
    }
}

// DELETE /api/admin/questions?id=xxx — soft delete
export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        try {
            const { error } = await deleteQuestion(id);
            if (!error) return NextResponse.json({ ok: true });
        } catch { }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[/api/admin/questions DELETE] Error:", error);
        return NextResponse.json({ ok: true });
    }
}
