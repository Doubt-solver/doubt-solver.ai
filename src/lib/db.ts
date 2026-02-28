import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

// ─── Profile ─────────────────────────────────────────────

export async function getUserProfile(userId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    return data;
}

export async function updateUserProfile(
    userId: string,
    updates: { name?: string; grade?: string; board?: string }
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
    return { error };
}

// ─── Exam Stats ──────────────────────────────────────────

export async function getUserStats(userId: string) {
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level, streak, last_active")
        .eq("id", userId)
        .single();

    const { count: examCount } = await supabase
        .from("exam_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    const { data: examScores } = await supabase
        .from("exam_sessions")
        .select("score, total")
        .eq("user_id", userId);

    let avgScore = 0;
    if (examScores && examScores.length > 0) {
        const totalScore = examScores.reduce((a, e) => a + e.score, 0);
        const totalPossible = examScores.reduce((a, e) => a + e.total, 0);
        avgScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    }

    return {
        xp: profile?.xp ?? 0,
        level: profile?.level ?? 1,
        streak: profile?.streak ?? 0,
        lastActive: profile?.last_active,
        examCount: examCount ?? 0,
        avgScore,
    };
}

export async function getRecentExams(userId: string, limit = 5) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("exam_sessions")
        .select("id, subject, topic, score, total, xp_earned, difficulty, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
    return data ?? [];
}

// ─── Subject & Topic Progress ────────────────────────────

export async function getSubjectProgress(userId: string) {
    const supabase = await createClient();
    const { data: exams } = await supabase
        .from("exam_sessions")
        .select("subject, score, total")
        .eq("user_id", userId);

    if (!exams || exams.length === 0) return [];

    const subjectMap: Record<string, { totalScore: number; totalPossible: number; count: number }> = {};
    for (const e of exams) {
        if (!subjectMap[e.subject]) {
            subjectMap[e.subject] = { totalScore: 0, totalPossible: 0, count: 0 };
        }
        subjectMap[e.subject].totalScore += e.score;
        subjectMap[e.subject].totalPossible += e.total;
        subjectMap[e.subject].count += 1;
    }

    return Object.entries(subjectMap).map(([name, stats]) => ({
        name,
        avg: stats.totalPossible > 0 ? Math.round((stats.totalScore / stats.totalPossible) * 100) : 0,
        exams: stats.count,
    }));
}

export async function getTopicProgress(userId: string) {
    const supabase = await createClient();
    const { data: exams } = await supabase
        .from("exam_sessions")
        .select("subject, topic, score, total")
        .eq("user_id", userId);

    if (!exams || exams.length === 0) return {};

    const topicMap: Record<string, Record<string, { totalScore: number; totalPossible: number }>> = {};
    for (const e of exams) {
        if (!topicMap[e.subject]) topicMap[e.subject] = {};
        const topic = e.topic || "General";
        if (!topicMap[e.subject][topic]) {
            topicMap[e.subject][topic] = { totalScore: 0, totalPossible: 0 };
        }
        topicMap[e.subject][topic].totalScore += e.score;
        topicMap[e.subject][topic].totalPossible += e.total;
    }

    // Convert to progress percentages
    const result: Record<string, Record<string, number>> = {};
    for (const [subject, topics] of Object.entries(topicMap)) {
        result[subject] = {};
        for (const [topic, stats] of Object.entries(topics)) {
            result[subject][topic] = stats.totalPossible > 0
                ? Math.round((stats.totalScore / stats.totalPossible) * 100)
                : 0;
        }
    }
    return result;
}

// ─── Weekly XP ───────────────────────────────────────────

export async function getWeeklyXP(userId: string) {
    const supabase = await createClient();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();

        const { data } = await supabase
            .from("exam_sessions")
            .select("xp_earned")
            .eq("user_id", userId)
            .gte("created_at", dayStart)
            .lt("created_at", dayEnd);

        const dayXP = data?.reduce((sum, e) => sum + (e.xp_earned || 0), 0) ?? 0;
        weekData.push({ day: days[d.getDay()], xp: dayXP });
    }

    return weekData;
}

// ─── Leaderboard ─────────────────────────────────────────

export async function getLeaderboard(limit = 10) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("profiles")
        .select("id, name, xp, level, grade")
        .order("xp", { ascending: false })
        .limit(limit);
    return data ?? [];
}

// ─── Badges ──────────────────────────────────────────────

export interface BadgeDefinition {
    key: string;
    name: string;
    icon: string;
    desc: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    { key: "first_exam", name: "First Exam", icon: "📝", desc: "Complete your first exam" },
    { key: "sharp_shooter", name: "Sharp Shooter", icon: "🎯", desc: "Get a perfect score" },
    { key: "streak_3", name: "On Fire", icon: "🔥", desc: "3-day streak" },
    { key: "streak_7", name: "Perfect Week", icon: "⭐", desc: "7-day streak" },
    { key: "streak_30", name: "Streak Legend", icon: "🏆", desc: "30-day streak" },
    { key: "exams_5", name: "Bookworm", icon: "📚", desc: "Complete 5 exams" },
    { key: "exams_25", name: "Scholar", icon: "🎓", desc: "Complete 25 exams" },
    { key: "exams_100", name: "Century Club", icon: "💯", desc: "Complete 100 exams" },
    { key: "xp_500", name: "Rising Star", icon: "⚡", desc: "Earn 500 XP" },
    { key: "xp_2000", name: "XP Master", icon: "🧠", desc: "Earn 2,000 XP" },
    { key: "xp_5000", name: "Diamond Champion", icon: "💎", desc: "Earn 5,000 XP" },
    { key: "high_score", name: "Quick Thinker", icon: "🚀", desc: "Score 90%+ on an exam" },
    { key: "math_master", name: "Math Wizard", icon: "🧮", desc: "Take 10 Math exams" },
    { key: "science_pro", name: "Science Pro", icon: "🔬", desc: "Take 10 Science exams" },
    { key: "all_subjects", name: "Well Rounded", icon: "🌈", desc: "Take exams in all 5 subjects" },
];

export async function getUserBadges(userId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("user_badges")
        .select("badge_key, earned_at")
        .eq("user_id", userId);
    return data ?? [];
}

export async function evaluateAndAwardBadges(userId: string) {
    const supabase = await createClient();

    // Get current badges
    const { data: currentBadges } = await supabase
        .from("user_badges")
        .select("badge_key")
        .eq("user_id", userId);
    const earned = new Set(currentBadges?.map((b) => b.badge_key) ?? []);

    // Get user stats
    const { data: profile } = await supabase
        .from("profiles")
        .select("xp, streak")
        .eq("id", userId)
        .single();

    const { data: exams } = await supabase
        .from("exam_sessions")
        .select("subject, score, total")
        .eq("user_id", userId);

    const xp = profile?.xp ?? 0;
    const streak = profile?.streak ?? 0;
    const examCount = exams?.length ?? 0;
    const subjects = new Set(exams?.map((e) => e.subject) ?? []);
    const hasPerfect = exams?.some((e) => e.score === e.total) ?? false;
    const hasHigh = exams?.some((e) => e.total > 0 && (e.score / e.total) >= 0.9) ?? false;
    const mathExams = exams?.filter((e) => e.subject === "Mathematics").length ?? 0;
    const scienceExams = exams?.filter((e) => e.subject === "Science").length ?? 0;

    // Check each badge
    const checks: Record<string, boolean> = {
        first_exam: examCount >= 1,
        sharp_shooter: hasPerfect,
        streak_3: streak >= 3,
        streak_7: streak >= 7,
        streak_30: streak >= 30,
        exams_5: examCount >= 5,
        exams_25: examCount >= 25,
        exams_100: examCount >= 100,
        xp_500: xp >= 500,
        xp_2000: xp >= 2000,
        xp_5000: xp >= 5000,
        high_score: hasHigh,
        math_master: mathExams >= 10,
        science_pro: scienceExams >= 10,
        all_subjects: subjects.size >= 5,
    };

    // Award new badges
    const newBadges: string[] = [];
    for (const [key, unlocked] of Object.entries(checks)) {
        if (unlocked && !earned.has(key)) {
            newBadges.push(key);
        }
    }

    if (newBadges.length > 0) {
        await supabase.from("user_badges").insert(
            newBadges.map((key) => ({ user_id: userId, badge_key: key }))
        );
    }

    return newBadges;
}

// ═══════════════════════════════════════════════════════════
// ADMIN / TEACHER SECTION
// ═══════════════════════════════════════════════════════════

// ─── Role Check ──────────────────────────────────────────

export async function getUserRole(userId: string): Promise<string> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
    return data?.role ?? "student";
}

export async function requireAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === "admin" || role === "teacher";
}

// ─── Question Bank ───────────────────────────────────────

export async function listQuestions(filters?: { subject?: string; topic?: string; search?: string }) {
    const supabase = createAdminClient();
    let query = supabase
        .from("question_bank")
        .select("*")
        .order("created_at", { ascending: false });

    if (filters?.subject && filters.subject !== "All") {
        query = query.eq("subject", filters.subject);
    }
    if (filters?.topic) {
        query = query.ilike("topic", `%${filters.topic}%`);
    }
    if (filters?.search) {
        query = query.ilike("question_text", `%${filters.search}%`);
    }

    const { data, error } = await query;
    return { data: data ?? [], error };
}

export async function createQuestion(
    question: {
        subject: string;
        topic: string;
        difficulty: string;
        question_text: string;
        options: string[];
        correct_index: number;
        explanation?: string;
    },
    creatorId: string
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("question_bank")
        .insert({ ...question, created_by: creatorId === MOCK_USER_ID ? null : creatorId })
        .select()
        .single();
    return { data, error };
}

export async function updateQuestion(
    id: string,
    updates: Partial<{
        subject: string;
        topic: string;
        difficulty: string;
        question_text: string;
        options: string[];
        correct_index: number;
        explanation: string;
        is_active: boolean;
    }>
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("question_bank")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    return { data, error };
}

export async function deleteQuestion(id: string) {
    const supabase = createAdminClient();
    // Soft delete — mark inactive
    const { error } = await supabase
        .from("question_bank")
        .update({ is_active: false })
        .eq("id", id);
    return { error };
}

// ─── Quizzes ─────────────────────────────────────────────

export async function listQuizzes() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });
    return { data: data ?? [], error };
}

export async function createQuiz(
    quiz: { title: string; subject?: string; question_ids: string[]; time_limit_min?: number },
    creatorId: string
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("quizzes")
        .insert({ ...quiz, created_by: creatorId === MOCK_USER_ID ? null : creatorId })
        .select()
        .single();
    return { data, error };
}

export async function updateQuiz(
    id: string,
    updates: Partial<{ title: string; subject: string; question_ids: string[]; time_limit_min: number; is_published: boolean }>
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("quizzes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    return { data, error };
}

export async function deleteQuiz(id: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    return { error };
}

// ─── Announcements ───────────────────────────────────────

export async function listAnnouncements() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
    return { data: data ?? [], error };
}

export async function createAnnouncement(
    announcement: { title: string; body: string; audience?: string; is_pinned?: boolean },
    creatorId: string
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("announcements")
        .insert({ ...announcement, created_by: creatorId === MOCK_USER_ID ? null : creatorId })
        .select()
        .single();
    return { data, error };
}

export async function deleteAnnouncement(id: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    return { error };
}

// ─── Problem of the Day ─────────────────────────────────

export async function getPotD(date?: string) {
    const supabase = createAdminClient();
    const targetDate = date ?? new Date().toISOString().slice(0, 10);

    // Get PotD with joined question if from bank
    const { data, error } = await supabase
        .from("problem_of_the_day")
        .select("*, question_bank(*)")
        .eq("scheduled_date", targetDate)
        .single();

    return { data, error };
}

export async function listPotD() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("problem_of_the_day")
        .select("*, question_bank(question_text, subject, topic)")
        .order("scheduled_date", { ascending: false })
        .limit(30);
    return { data: data ?? [], error };
}

export async function setPotD(
    entry: { scheduled_date: string; question_bank_id?: string; custom_question?: Record<string, unknown> },
    creatorId: string
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("problem_of_the_day")
        .upsert({ ...entry, created_by: creatorId === MOCK_USER_ID ? null : creatorId }, { onConflict: "scheduled_date" })
        .select()
        .single();
    return { data, error };
}

// ─── Question Reports ────────────────────────────────────

export async function listReports(status?: string) {
    const supabase = createAdminClient();
    let query = supabase
        .from("question_reports")
        .select("*")
        .order("created_at", { ascending: false });

    if (status && status !== "all") {
        query = query.eq("status", status);
    }

    const { data, error } = await query;
    return { data: data ?? [], error };
}

export async function submitReport(
    report: { question_data: Record<string, unknown>; reason: string },
    userId: string
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("question_reports")
        .insert({ ...report, reported_by: userId === MOCK_USER_ID ? null : userId })
        .select()
        .single();
    return { data, error };
}

export async function updateReportStatus(
    id: string,
    status: string,
    adminId: string,
    adminNotes?: string
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("question_reports")
        .update({ status, resolved_by: adminId, admin_notes: adminNotes ?? null })
        .eq("id", id)
        .select()
        .single();
    return { data, error };
}

// ─── Student Revisions ──────────────────────────────────

export async function listRevisions(userId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("revision_list")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    return { data: data ?? [], error };
}

export async function addRevision(
    userId: string,
    item: { question_data: Record<string, unknown>; source?: string; notes?: string }
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("revision_list")
        .insert({ ...item, user_id: userId === MOCK_USER_ID ? null : userId })
        .select()
        .single();
    return { data, error };
}

export async function updateRevision(
    id: string,
    updates: Partial<{ notes: string; is_mastered: boolean }>
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("revision_list")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    return { data, error };
}

export async function deleteRevision(id: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("revision_list").delete().eq("id", id);
    return { error };
}

// ─── Admin Dashboard Stats ──────────────────────────────

export async function getAdminStats() {
    const supabase = createAdminClient();

    const [questions, quizzes, reports, students] = await Promise.all([
        supabase.from("question_bank").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("quizzes").select("*", { count: "exact", head: true }),
        supabase.from("question_reports").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    ]);

    const { data: recentReports } = await supabase
        .from("question_reports")
        .select("id, reason, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        totalQuestions: questions.count ?? 0,
        totalQuizzes: quizzes.count ?? 0,
        openReports: reports.count ?? 0,
        totalStudents: students.count ?? 0,
        recentReports: recentReports ?? [],
    };
}
