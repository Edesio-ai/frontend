import type { InvitationToken, TeacherWithStats } from "@/types";
import { getInvitationFullName } from "../../invitations/_components/invitation-identity";

export type RecentActivityType = "invited" | "joined";

export type RecentActivityItem = {
  id: string;
  type: RecentActivityType;
  name: string;
  at: string;
};

const MAX_ITEMS = 8;
const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function isRecent(at: string, now: number): boolean {
  const time = new Date(at).getTime();
  return Number.isFinite(time) && time <= now + 60_000 && now - time <= RECENT_WINDOW_MS;
}

export function buildRecentActivityItems(
  invitations: InvitationToken[],
  teachers: TeacherWithStats[],
): RecentActivityItem[] {
  const invitationEmails = new Set(invitations.map((invitation) => invitation.invitedEmail.toLowerCase()));

  const invitationItems = invitations.map((invitation): RecentActivityItem => {
    const name = getInvitationFullName(invitation);

    if (invitation.usedAt) {
      return {
        id: `invitation-joined-${invitation.id}`,
        type: "joined",
        name,
        at: invitation.usedAt,
      };
    }

    return {
      id: `invitation-sent-${invitation.id}`,
      type: "invited",
      name,
      at: invitation.createdAt,
    };
  });

  const teacherItems = teachers
    .filter((teacher) => !invitationEmails.has(teacher.email.toLowerCase()))
    .map((teacher): RecentActivityItem => ({
      id: `teacher-joined-${teacher.id}`,
      type: "joined",
      name: teacher.name,
      at: teacher.createdAt,
    }));

  const now = Date.now();

  return [...invitationItems, ...teacherItems]
    .filter((item) => isRecent(item.at, now))
    .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime())
    .slice(0, MAX_ITEMS);
}
