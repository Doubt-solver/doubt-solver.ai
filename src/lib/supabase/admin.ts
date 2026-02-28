import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using the service_role key.
 * Bypasses Row Level Security — use ONLY in server-side API routes.
 * Never expose this key to the browser.
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
    }

    return createSupabaseClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
