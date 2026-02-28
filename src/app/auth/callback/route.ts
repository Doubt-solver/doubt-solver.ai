import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    let isNewUser = false;

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: existingProfile } = await supabase
                    .from("profiles")
                    .select("id, grade")
                    .eq("id", user.id)
                    .single();

                if (!existingProfile) {
                    // New user — create basic profile, redirect to onboarding
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
                    isNewUser = true;
                }
            }
        }
    }

    // New users go to onboarding, returning users go to dashboard
    const redirectPath = isNewUser ? "/auth/onboarding" : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
