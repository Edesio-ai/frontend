import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

import type {
  Establishment,
  InvitationToken,
  TeacherWithStats,
  Student
} from "@/types";
import { establishmentService } from "@/services/establishment.service";

function generateInvitationCode(length: number = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface EtablissementStats {
  totalProfesseurs: number;
  totalSessions: number;
  totalEleves: number;
}

export function useEstablishment() {
  const { user, loading: authLoading } = useAuth();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [professeurs, setProfesseurs] = useState<TeacherWithStats[]>([]);
  const [invitationTokens, setInvitationTokens] = useState<InvitationToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<EtablissementStats>({
    totalProfesseurs: 0,
    totalSessions: 0,
    totalEleves: 0,
  });

  const insertEstablishment = async (name: string) => {
    try {
      const establishment = await establishmentService.createEstablishment(user?.id || "", name, user?.email || "");
      setEstablishment(establishment);
      setStats({ totalProfesseurs: 0, totalSessions: 0, totalEleves: 0 });
      setProfesseurs([]);
      return establishment;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue. Merci de réessayer.";
      console.error("Error creating establishment:", message);
      setError("Erreur lors de la création du profil établissement");
    }
  }

  const getEstablishmentStats = async () => {
    try {
      const response = await establishmentService.getEstablishmentStats();
      setEstablishment(response.establishment);
      setProfesseurs(response.teachers);
      setStats(response.stats);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue. Merci de réessayer.";
      if (message.includes("404")) {
        const name = user.user_metadata?.establishment ||
          (user.user_metadata?.firstname && user.user_metadata?.lastname
            ? `${user.user_metadata.firstname} ${user.user_metadata.lastname}`
            : "Établissement");

        await insertEstablishment(name);
        return
      }
      setError(message || "Erreur lors du chargement des données");

    } finally {
      setLoading(false);
    }
  }

  const fetchEtablissementData = useCallback(async () => {
    if (!user) {
      setEstablishment(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    await getEstablishmentStats();
  }, [user]);

  const fetchInvitationTokens = useCallback(async () => {
    if (!establishment) {
      setInvitationTokens([]);
      return;
    }

    try {
      const tokens = await establishmentService.getInvitationTokens(establishment.id);
      setInvitationTokens(tokens);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Erreur lors du chargement des codes d'invitation.");
    }
  }, [establishment]);

  const createInvitationToken = useCallback(
    async (invitedEmail: string, expiresInDays: number = 7, chatbotsAlloues: number = 0): Promise<InvitationToken | null> => {
      //   if (!establishment) return null;

      //   if (!invitedEmail || !invitedEmail.includes("@")) {
      //     setError("Veuillez entrer une adresse email valide.");
      //     return null;
      //   }

      //   try {
      //     const token = generateInvitationCode();
      //     const expiresAt = new Date();
      //     expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      //     const { data, error: insertError } = await supabase
      //       .from("invitation_tokens")
      //       .insert({
      //         etablissement_id: establishment.id,
      //         token,
      //         invited_email: invitedEmail.toLowerCase().trim(),
      //         expires_at: expiresAt.toISOString(),
      //         chatbots_alloues: chatbotsAlloues,
      //       })
      //       .select()
      //       .single();

      //     if (insertError) {
      //       console.error("Error creating invitation token:", insertError);
      //       setError("Erreur lors de la création du code d'invitation.");
      //       return null;
      //     }

      //     // Send invitation email
      //     if (session?.access_token && establishment) {
      //       try {
      //         await fetch("/api/send-invitation-email", {
      //           method: "POST",
      //           headers: {
      //             "Content-Type": "application/json",
      //             Authorization: `Bearer ${session.access_token}`,
      //           },
      //           body: JSON.stringify({
      //             invitedEmail: invitedEmail.toLowerCase().trim(),
      //             etablissementNom: establishment.nom,
      //             invitationToken: token,
      //             chatbotsAlloues,
      //           }),
      //         });
      //       } catch (emailError) {
      //         console.error("Failed to send invitation email:", emailError);
      //         // Don't fail the invitation creation if email fails
      //       }
      //     }

      //     await fetchInvitationTokens();
      //     return data;
      //   } catch (err) {
      //     console.error("Unexpected error:", err);
      //     setError("Une erreur est survenue. Merci de réessayer.");
      //     return null;
      //   }
      return null
    },
    [establishment, fetchInvitationTokens, "session"]
  );

  const deleteInvitationToken = useCallback(
    async (tokenId: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from("invitation_tokens")
          .delete()
          .eq("id", tokenId);

        if (deleteError) {
          console.error("Error deleting token:", deleteError);
          return false;
        }

        await fetchInvitationTokens();
        return true;
      } catch (err) {
        console.error("Unexpected error:", err);
        return false;
      }
    },
    [fetchInvitationTokens]
  );

  const getSessionStudents = useCallback(
    async (sessionId: string): Promise<Student[]> => {
      try {
        const { data: eleveSessions, error: esError } = await supabase
          .from("eleve_sessions")
          .select("eleve_id")
          .eq("session_id", sessionId);

        if (esError || !eleveSessions?.length) {
          return [];
        }

        const eleveIds = eleveSessions.map((es) => es.eleve_id);
        const { data: eleves, error: elevesError } = await supabase
          .from("eleves")
          .select("*")
          .in("id", eleveIds);

        if (elevesError) {
          console.error("Error fetching students:", elevesError);
          return [];
        }

        return eleves || [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    []
  );

  const getSessionCours = useCallback(
    async (sessionId: string): Promise<any> => {
      //   if (!session?.access_token) return [];

      //   try {
      //     const response = await fetch(`/api/establishment/sessions/${sessionId}/cours`, {
      //       headers: {
      //         Authorization: `Bearer ${session.access_token}`,
      //       },
      //     });

      //     if (!response.ok) {
      //       console.error("Error fetching session courses");
      //       return [];
      //     }

      //     return await response.json();
      //   } catch (err) {
      //     console.error("Unexpected error:", err);
      //     return [];
      //   }
    },
    ["session"]
  );

  const getCourseDetails = useCallback(
    async (coursId: string): Promise<{
      cours: { id: string; titre: string; description: string | null; contenu_texte: string | null; questions_validees: boolean };
      questions: { id: string; question: string; type: string; reponse_correcte: string; options: string[] | null }[];
      students: { id: string; nom: string; email: string; photo_url: string | null; reponses_correctes: number; reponses_totales: number }[];
      fichiers: { id: string; nom_fichier: string }[];
    } | null> => {
      //   if (!session?.access_token) return null;

      //   try {
      //     const response = await fetch(`/api/establishment/cours/${coursId}`, {
      //       headers: {
      //         Authorization: `Bearer ${session.access_token}`,
      //       },
      //     });

      //     if (!response.ok) {
      //       console.error("Error fetching course details");
      //       return null;
      //     }

      //     return await response.json();
      //   } catch (err) {
      //     console.error("Unexpected error:", err);
      //     return null;
      //   }

      return null
    },
    ["session"]
  );

  const refreshData = useCallback(async () => {
    await fetchEtablissementData();
    if (establishment) {
      await fetchInvitationTokens();
    }
  }, [fetchEtablissementData, establishment, fetchInvitationTokens]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchEtablissementData();
    }
  }, [authLoading, user, fetchEtablissementData]);

  useEffect(() => {
    if (establishment) {
      fetchInvitationTokens();
    }
  }, [establishment, fetchInvitationTokens]);

  return {
    establishment,
    professeurs,
    invitationTokens,
    stats,
    loading: loading || authLoading,
    error,
    refreshData,
    createInvitationToken,
    deleteInvitationToken,
    getSessionStudents,
    getSessionCours,
    getCourseDetails,
  };
}
