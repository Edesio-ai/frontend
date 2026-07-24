export type User = {
  id: string;
  email: string;
  emailConfirmedAt: string;
  metadata: UserMetadata;
};

export type UserMetadata = {
  role?: string;
  firstname?: string;
  lastname?: string;
  firstName?: string;
  lastName?: string;
  establishment?: string;
  invitationToken?: string;
};
