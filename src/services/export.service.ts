import { getCookie } from "@/lib/cookies";
import { downloadPdf } from "@/lib/pdf-export";
import { Question } from "@/types";

export const exportService = {
    exportQuestionsPdf: async (questions: Question[], courseTitle: string, sessionName: string): Promise<void> => {
        const csrfToken = getCookie("csrf_token");
        const response = await fetch(`/api/export/questions`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
            },
            body: JSON.stringify({ questions, courseTitle, sessionName }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error?.message ?? "Export échoué");
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get("content-disposition") ?? "";
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        downloadPdf(blob, match?.[1] ?? `questions_${courseTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    },
    exportCourseFilePdf: async (fileId: string, fileName: string): Promise<void> => {
        const csrfToken = getCookie("csrf_token");
        const response = await fetch(`/api/export/file/${fileId}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error?.message ?? "Export échoué");
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get("content-disposition") ?? "";
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        const exportFileName = match?.[1] ?? fileName.replace(/[^a-zA-Z0-9]/g, "_");
        downloadPdf(blob, exportFileName);
    },
};