import { PUBLIC_ROLES, USER_ROLE, type PublicRole, type UserRole } from "@/types";

export { USER_ROLE };

export function isPublicRole(role: string | null | undefined): role is PublicRole {
  return PUBLIC_ROLES.includes(role as PublicRole);
}

export function getRegisterRolePath(role: PublicRole): string {
  return `/register/${role}`;
}

export function getRegisterInvitationPath(token: string): string {
  return `/register/invitation/${token}`;
}

export function getLegacyRegisterInvitationPath(token: string): string {
  return `/register/teacher-invitation/${token}`;
}

export function isAdmin(role: string | null | undefined): role is typeof USER_ROLE.admin {
  return role === USER_ROLE.admin;
}

export function canAccessModule(role: string | null | undefined, module: PublicRole): boolean {
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
