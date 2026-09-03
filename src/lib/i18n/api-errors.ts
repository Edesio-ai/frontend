export type ApiErrorTranslations = {
  invitationEmailAlreadyRegistered?: string;
};

export function translateApiError(
  code: string | undefined,
  fallbackMessage: string,
  translations: ApiErrorTranslations,
): string {
  switch (code) {
    case "INVITATION_EMAIL_ALREADY_REGISTERED":
      return translations.invitationEmailAlreadyRegistered ?? fallbackMessage;
    default:
      return fallbackMessage;
  }
}
