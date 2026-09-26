import { RequireRole } from "@/components/auth/require-role";
import { USER_ROLE } from "@/utils/functions/role.utils";
import { EstablishmentLayoutGate } from "./_components/establishment-layout-gate";
import { EstablishmentProvider } from "./_contexts/establishment-context";

export default function EstablishmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole module={USER_ROLE.establishment}>
      <EstablishmentProvider>
        <EstablishmentLayoutGate>{children}</EstablishmentLayoutGate>
      </EstablishmentProvider>
    </RequireRole>
  );
}
