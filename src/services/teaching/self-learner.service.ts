import { apiFetch } from "@/lib/api-client";
import { SelfLearner } from "@/types";

export const selfLearnerService = {
    async getSelfLearner(): Promise<SelfLearner | null> {
        const response = await apiFetch<SelfLearner>("/api/self-learner");
        return response;
    },
    async createSelfLearner(): Promise<SelfLearner> {
        const response = await apiFetch<SelfLearner>("/api/self-learner", {
            method: "POST"
        });
        return response;
    }
}