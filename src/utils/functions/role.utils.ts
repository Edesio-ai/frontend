import { USER_ROLE, type UserRole } from "@/types";

export { USER_ROLE };

export const MODULE_ROLES = [
  USER_ROLE.teacher,
  USER_ROLE.student,
  USER_ROLE.establishment,
  USER_ROLE.selfLearner,
] as const;

export type ModuleRole = (typeof MODULE_ROLES)[number];

export function isAdmin(role: string | null | undefined): role is typeof USER_ROLE.admin {
  return role === USER_ROLE.admin;
}

export function canAccessModule(role: string | null | undefined, module: ModuleRole): boolean {
  return isAdmin(role) || role === module;
}

export const POST_LOGIN_PATH: Record<UserRole, string> = {
  [USER_ROLE.admin]: "/hub",
  [USER_ROLE.teacher]: "/teacher",
  [USER_ROLE.student]: "/student",
  [USER_ROLE.establishment]: "/establishment",
  [USER_ROLE.selfLearner]: "/self-learner",
};

export function getPostLoginPath(role: string | null | undefined): string {
  if (!role || !(role in POST_LOGIN_PATH)) return "/";
  return POST_LOGIN_PATH[role as UserRole];
}
