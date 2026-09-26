import { RequireRole } from "@/components/auth/require-role";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import { USER_ROLE } from "@/utils/functions/role.utils";
import { TeacherProvider } from "./_contexts/teacher-context";
import { TeacherHeader } from "./_components/teacher-header";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <RequireRole module={USER_ROLE.teacher}>
      <TeacherProvider>
        <SubscriptionBlockModal>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
          <TeacherHeader />
          {children}
        </SubscriptionBlockModal>
      </TeacherProvider>
    </RequireRole>
  );
}
