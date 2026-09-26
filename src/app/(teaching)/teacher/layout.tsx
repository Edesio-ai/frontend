import { RequireRole } from "@/components/auth/require-role";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import { USER_ROLE } from "@/utils/functions/role.utils";
import { TeacherProvider } from "./_contexts/teacher-context";
import { TeacherLayoutGate } from "./_components/teacher-layout-gate";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <RequireRole module={USER_ROLE.teacher}>
      <TeacherProvider>
        <SubscriptionBlockModal>
          <TeacherLayoutGate>{children}</TeacherLayoutGate>
        </SubscriptionBlockModal>
      </TeacherProvider>
    </RequireRole>
  );
}
