import { RequireRole } from "@/components/auth/require-role";
import { USER_ROLE } from "@/utils/functions/role.utils";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole module={USER_ROLE.student}>{children}</RequireRole>;
}
