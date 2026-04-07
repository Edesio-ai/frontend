export interface Establishment {
    id: string;
    supabase_user_id: string;
    name: string;
    email: string;
    created_at: string;
}

export interface InvitationToken {
    id: string;
    etablishment_id: string;
    token: string;
    invited_email: string;
    expires_at: string;
    used_at: string | null;
    used_by: string | null;
    created_at: string;
    available_chatbots: number;
}