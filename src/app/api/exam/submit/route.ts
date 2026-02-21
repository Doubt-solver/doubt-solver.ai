import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        const { subject, topic, difficulty, score, total, questions, answers } = body;

        // Calculate XP
        const scorePercent = Math.round((score / total) * 100);
        let xpEarned = score * 10; // 10 XP per correct answer
        if (scorePercent >= 80) xpEarned += 25; // bonus
        if (scorePercent === 100) xpEarned += 50; // perfect

        // Save exam session
        const { error: examError } = await supabase.from("exam_sessions").insert({
            user_id: user.id,
            subject,
            topic,
            difficulty,
            score,
            total,
            xp_earned: xpEarned,
            questions_json: questions,
            answers_json: answers,
        });

        if (examError) {
            console.error("Error saving exam:", examError);
            // Don't fail — still return XP info even if DB save fails
        }

        // Update user profile XP and streak
        const today = new Date().toISOString().split("T")[0];

        // Get current profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("xp, streak, last_active, level")
            .eq("id", user.id)
            .single();

        if (profile) {
            const lastActive = profile.last_active;
            const yesterday = new Date(Date.now() - 86400000)
                .toISOString()
                .split("T")[0];

            let newStreak = profile.streak;
            if (lastActive === yesterday) {
                newStreak += 1; // continue streak
            } else if (lastActive !== today) {
                newStreak = 1; // reset streak
            }
            // if lastActive === today, streak stays the same

            const newXP = profile.xp + xpEarned;
            const newLevel = calculateLevel(newXP);

            await supabase
                .from("profiles")
                .update({
                    xp: newXP,
                    streak: newStreak,
                    level: newLevel,
                    last_active: today,
                })
                .eq("id", user.id);
        }

        return NextResponse.json({
            success: true,
            xpEarned,
            scorePercent,
        });
    } catch (error) {
        console.error("Error submitting exam:", error);
        return NextResponse.json(
            { error: "Failed to submit exam" },
            { status: 500 }
        );
    }
}

function calculateLevel(xp: number): number {
    if (xp >= 10000) return 10;
    if (xp >= 7000) return 9;
    if (xp >= 5000) return 8;
    if (xp >= 3500) return 7;
    if (xp >= 2500) return 6;
    if (xp >= 1500) return 5;
    if (xp >= 1000) return 4;
    if (xp >= 600) return 3;
    if (xp >= 300) return 2;
    return 1;
}
