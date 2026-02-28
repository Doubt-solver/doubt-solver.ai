import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateUserProfile } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, grade, board } = body;

        const { error } = await updateUserProfile(user.id, { name, grade, board });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[/api/user/profile] Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
