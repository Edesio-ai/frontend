export type InvitationFormValues = {
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type InvitationErrorCode =
  | "defaultError"
  | "signInError"
  | "invitationInvalid"
  | "invitationExpired"
  | "invitationAlreadyUsed"
  | "invitationEmailMismatch"
  | "userAlreadyRegistered";

export type InvitationState = {
  error: InvitationErrorCode | null;
  fieldErrors: {
    password?: string[];
    confirmPassword?: string[];
    acceptTerms?: string[];
  };
  redirectTo: string | null;
  values: InvitationFormValues;
};

export const emptyInvitationFormValues: InvitationFormValues = {
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export const initialInvitationState: InvitationState = {
  error: null,
  fieldErrors: {},
  redirectTo: null,
  values: emptyInvitationFormValues,
};
