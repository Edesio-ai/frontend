import { apiFetch } from "@/lib/api-client";
import { CreateSuggestion, LikeSuggestionResponse, Suggestion } from "@/types/suggestion.type";

export const suggestionService = {
  async getSuggestions(category: string): Promise<Suggestion[]> {
    const response = await apiFetch<Suggestion[]>(`/api/suggestion/category/${category}`);
    return response;
  },
  async likeSuggestion(suggestionId: string): Promise<LikeSuggestionResponse> {
    const response = await apiFetch<LikeSuggestionResponse>(`/api/suggestion/${suggestionId}/like`, {
      method: "POST",
    });
    return response;
  },
  async createSuggestion(suggestion: CreateSuggestion): Promise<Suggestion | null> {
    const response = await apiFetch<Suggestion | null>(`/api/suggestion`, {
      method: "POST",
      body: JSON.stringify(suggestion),
    });
    return response;
  },
  async deleteSuggestion(suggestionId: string): Promise<void> {
    const response = await apiFetch<void>(`/api/suggestion/${suggestionId}`, {
      method: "DELETE",
    });
    return response;
  },
};
