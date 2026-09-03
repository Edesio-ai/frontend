import { Building2, GraduationCap, Sparkles, Users } from "lucide-react";

import { POST_LOGIN_PATH, USER_ROLE } from "@/utils/functions/role.utils";

export const HUB_SPACES = [
  {
    href: POST_LOGIN_PATH[USER_ROLE.establishment],
    titleKey: "establishment",
    descKey: "establishmentDesc",
    icon: Building2,
    iconWrap: "bg-primary/10",
    iconClass: "text-primary",
    testId: "card-hub-establishment",
  },
  {
    href: POST_LOGIN_PATH[USER_ROLE.teacher],
    titleKey: "teacher",
    descKey: "teacherDesc",
    icon: GraduationCap,
    iconWrap: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
    iconClass: "text-emerald-600",
    testId: "card-hub-teacher",
  },
  {
    href: POST_LOGIN_PATH[USER_ROLE.student],
    titleKey: "student",
    descKey: "studentDesc",
    icon: Users,
    iconWrap: "bg-primary/10",
    iconClass: "text-primary",
    testId: "card-hub-student",
  },
  {
    href: POST_LOGIN_PATH[USER_ROLE.selfLearner],
    titleKey: "selfLearner",
    descKey: "selfLearnerDesc",
    icon: Sparkles,
    iconWrap: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
    iconClass: "text-amber-600",
    testId: "card-hub-self-learner",
  },
] as const;

export type HubSpace = (typeof HUB_SPACES)[number];
