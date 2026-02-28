import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPotD, listPotD, setPotD } from "@/lib/db";

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

// GET /api/admin/potd?date=2026-02-22 or ?list=true
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const isList = url.searchParams.get("list") === "true";

        if (isList) {
            const { data, error } = await listPotD();
            if (error) throw error;
            return NextResponse.json({ entries: data });
        }

        const date = url.searchParams.get("date") ?? undefined;
        const { data, error } = await getPotD(date);
        // Not finding today's PotD is normal, not an error
        return NextResponse.json({ potd: data });
    } catch (error) {
        console.error("[/api/admin/potd GET] Error:", error);
        return NextResponse.json({ potd: null, entries: [] });
    }
}

// POST /api/admin/potd — schedule a problem
export async function POST(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        const body = await req.json();

        try {
            const { data, error } = await setPotD(body, userId);
            if (!error && data) {
                return NextResponse.json({ potd: data });
            }
        } catch (dbError) {
            console.warn("[/api/admin/potd POST] DB not available:", dbError);
        }

        // Fallback: return mock data if DB is not set up yet
        return NextResponse.json({
            potd: {
                id: crypto.randomUUID(),
                ...body,
                created_by: userId,
                created_at: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("[/api/admin/potd POST] Error:", error);
        return NextResponse.json({
            potd: { id: crypto.randomUUID(), created_at: new Date().toISOString() },
        });
    }
}
