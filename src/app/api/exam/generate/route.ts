import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/ai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            subject = "Science",
            topic = "General",
            difficulty = "Medium",
            count = 10,
            grade = "Class 10",
        } = body;

        const questions = await generateQuestions({
            subject,
            topic,
            difficulty,
            count: Math.min(count, 20), // cap at 20
            grade,
        });

        return NextResponse.json({ questions });
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error generating exam:", errMsg);

        const isRateLimit = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");

        return NextResponse.json(
            {
                error: isRateLimit
                    ? "AI quota exceeded. Please wait a few minutes and try again."
                    : "Failed to generate questions. Please try again.",
                fallback: true,
            },
            { status: isRateLimit ? 429 : 500 }
        );
    }
}
