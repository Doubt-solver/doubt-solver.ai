import { solveDoubt } from "@/lib/ai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { question, chatHistory, grade } = body;

        console.log("[/api/doubts/ask] Received:", question?.substring(0, 80));

        if (!question || typeof question !== "string") {
            return new Response(
                JSON.stringify({ error: "Question is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
            return new Response(
                JSON.stringify({ error: "Groq API key not configured. Get a free key at https://console.groq.com" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const context = undefined; // TODO: RAG context from pgvector

        const stream = await solveDoubt({
            question,
            context,
            chatHistory,
            grade,
        });

        // Create a ReadableStream from the Groq streaming response (OpenAI-compatible)
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content;
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (streamError) {
                    console.error("[/api/doubts/ask] Streaming error:", streamError);
                    controller.enqueue(
                        encoder.encode("\n\n[Error: Streaming was interrupted. Please try again.]")
                    );
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("[/api/doubts/ask] ERROR:", errMsg);

        const isRateLimit = errMsg.includes("429") || errMsg.includes("rate_limit") || errMsg.includes("quota");

        if (isRateLimit) {
            return new Response(
                JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ error: "Failed to process your question", details: errMsg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
