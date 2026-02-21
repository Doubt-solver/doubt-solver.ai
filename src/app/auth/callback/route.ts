import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if profile exists, create one if not
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: existingProfile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("id", user.id)
                    .single();

                if (!existingProfile) {
                    await supabase.from("profiles").insert({
                        id: user.id,
                        name:
                            user.user_metadata?.full_name ||
                            user.user_metadata?.name ||
                            user.email?.split("@")[0] ||
                            "Student",
                        grade: "Class 10",
                        board: "CBSE",
                        xp: 0,
                        level: 1,
                        streak: 0,
                        last_active: new Date().toISOString().split("T")[0],
                    });
                }
            }
        }
    }

    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
