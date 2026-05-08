import { sessionService } from "@/services/teaching/session.service";

export const generateSessionCode = (length: number = 6): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export const generateUniqueSessionCode = async (): Promise<string> => {
    let code = generateSessionCode();
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        const { session } = await sessionService.getSessionByCode(code);
        if (!session) break;
        code = generateSessionCode();
        attempts++;
    }
    return code;
};