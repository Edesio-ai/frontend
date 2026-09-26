import type { EstablishmentTeacherListItem, InvitationToken, TeacherWithStats } from "@/types";
import { getInvitationFullName } from "../../invitations/_components/invitation-identity";

export function buildTeacherListItems(
  teachers: TeacherWithStats[],
  invitationTokens: InvitationToken[],
): EstablishmentTeacherListItem[] {
  const teacherRows = teachers.map((teacher): EstablishmentTeacherListItem => ({
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    sessionsCount: teacher.sessionsCount,
    studentsCount: teacher.studentsCount,
    status: "active",
    source: "teacher",
  }));

  const invitationRows = invitationTokens
    .filter((invitation) => invitation.usedAt === null)
    .map((invitation): EstablishmentTeacherListItem => ({
      id: invitation.id,
      name: getInvitationFullName(invitation),
      email: invitation.invitedEmail,
      sessionsCount: 0,
      studentsCount: 0,
      status: "invited",
      source: "invitation",
    }));

  return [...teacherRows, ...invitationRows];
}
