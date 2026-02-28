import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitReport } from "@/lib/db";

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

// POST /api/student/report — submit a question report
export async function POST(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        const body = await req.json();

        if (!body.reason || !body.question_data) {
            return NextResponse.json({ error: "Missing reason or question_data" }, { status: 400 });
        }

        try {
            const { data, error } = await submitReport(
                { question_data: body.question_data, reason: body.reason },
                userId
            );
            if (!error && data) return NextResponse.json({ report: data });
        } catch (dbError) {
            console.warn("[/api/student/report POST] DB not available:", dbError);
        }

        return NextResponse.json({
            report: { id: crypto.randomUUID(), ...body, status: "open", created_at: new Date().toISOString() },
        });
    } catch (error) {
        console.error("[/api/student/report POST] Error:", error);
        return NextResponse.json({ report: { id: crypto.randomUUID(), status: "open", created_at: new Date().toISOString() } });
    }
}
