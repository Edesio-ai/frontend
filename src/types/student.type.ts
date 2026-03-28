export interface Student {
    id: string;
    supabase_user_id: string;
    nom: string;
    email: string;
    photo_url: string | null;
    created_at: string;
}