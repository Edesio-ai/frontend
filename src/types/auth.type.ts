import { ApiResponse } from "./teaching/global.type";
import { User } from "./user.type";

export const USER_ROLE = {
  teacher: "teacher",
  student: "student",
  establishment: "establishment",
  selfLearner: "self-learner",
  admin: "admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const PUBLIC_ROLES = [
  USER_ROLE.teacher,
  USER_ROLE.student,
  USER_ROLE.establishment,
  USER_ROLE.selfLearner,
] as const;

export type PublicRole = (typeof PUBLIC_ROLES)[number];

export interface UserMetadata {
  role: UserRole;
  firstName?: string;
  lastName?: string;
  establishment?: string;
  invitationToken?: string;
}

export type LoginResult = ApiResponse<User>;
