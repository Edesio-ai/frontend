export type UserRole = "teacher" | "student" | "establishment" | "self-learner";

export interface UserMetadata {
  role: UserRole;
  firstName?: string;
  lastName?: string;
  establishment?: string;
  invitationToken?: string;
}
