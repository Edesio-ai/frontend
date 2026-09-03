export const USER_ROLE = {
  teacher: "teacher",
  student: "student",
  establishment: "establishment",
  selfLearner: "self-learner",
  admin: "admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export interface UserMetadata {
  role: UserRole;
  firstName?: string;
  lastName?: string;
  establishment?: string;
  invitationToken?: string;
}
