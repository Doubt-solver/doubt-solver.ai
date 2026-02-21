import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️  GROQ_API_KEY is not set in .env.local");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

// Llama 3.3 70B — best open-source model for education
export const AI_MODEL = "llama-3.3-70b-versatile";

/**
 * Generate exam questions using Llama 3.3 via Groq
 */
export async function generateQuestions(params: {
    subject: string;
    topic: string;
    difficulty: string;
    count: number;
    grade: string;
}) {
    const { subject, topic, difficulty, count, grade } = params;

    const prompt = `You are an expert ${subject} teacher for ${grade} students (Indian curriculum: CBSE/ICSE).

Generate exactly ${count} multiple-choice questions on the topic "${topic}" at ${difficulty} difficulty level.

RULES:
- Each question must have exactly 4 options
- Only ONE correct answer per question
- Include a brief explanation for the correct answer
- Questions should be age-appropriate for ${grade} students
- Mix conceptual, numerical, and application-based questions
- Do NOT repeat similar questions

Respond ONLY with a valid JSON array, no markdown, no code blocks, no explanation:
[
  {
    "id": 1,
    "question": "Your question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why the answer is correct"
  }
]

correctAnswer is the 0-based index of the correct option.`;

    console.log("[AI] Generating questions:", { subject, topic, difficulty, count });

    const response = await groq.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 4096,
        response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    console.log("[AI] Response length:", text.length);

    const parsed = JSON.parse(text);

    // Handle both { questions: [...] } and direct array formats
    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;

    throw new Error("Unexpected response format");
}

/**
 * Solve a doubt with streaming using Llama 3.3 via Groq
 */
export async function solveDoubt(params: {
    question: string;
    context?: string;
    chatHistory?: Array<{ role: string; content: string }>;
    grade?: string;
}) {
    const { question, context, chatHistory, grade } = params;

    let systemPrompt = `You are a friendly, expert tutor for ${grade || "Class 10"} students (Indian curriculum).

RULES:
- Explain concepts clearly with examples
- Use bullet points and formatting for readability
- If the question is about a specific chapter/topic, reference NCERT content
- Be encouraging and supportive
- Keep explanations concise but thorough
- Use simple language appropriate for the student's grade level`;

    if (context) {
        systemPrompt += `\n\nHere is relevant textbook content to use as reference:\n---\n${context}\n---\nUse this content to provide accurate, syllabus-aligned answers.`;
    }

    // Build messages array
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
    ];

    // Add chat history
    if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory) {
            messages.push({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
            });
        }
    }

    // Add current question
    messages.push({ role: "user", content: question });

    console.log("[AI] Solving doubt:", question.substring(0, 80));

    const stream = await groq.chat.completions.create({
        model: AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
    });

    return stream;
}
