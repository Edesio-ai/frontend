import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        "Supabase credentials are missing. Authentication features will not work."
    );
}

export const supabase = createClient(
    supabaseUrl || "",
    supabaseAnonKey || ""
);

export type UserRole = "teacher" | "student" | "establishment" | "standalone";

export interface UserMetadata {
    role: UserRole;
    firstName?: string;
    lastName?: string;
    establishment?: string;
    invitationToken?: string;
}