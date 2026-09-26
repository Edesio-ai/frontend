import { InviteTeacherState, TeacherInvitation } from "@/types";

export const emptyInviteTeacherFormValues: TeacherInvitation = {
  firstname: "",
  lastname: "",
  email: "",
  assignedChatbots: 0,
};

export const initialInviteTeacherState: InviteTeacherState = {
  error: null,
  fieldErrors: {
    firstname: [],
    lastname: [],
    email: [],
    assignedChatbots: [],
  },
  values: emptyInviteTeacherFormValues,
  invitedEmail: null,
};
