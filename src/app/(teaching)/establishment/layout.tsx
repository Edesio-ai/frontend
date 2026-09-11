import { EstablishmentShell } from "./_components/establishment-shell";
import { EstablishmentProvider } from "./_contexts/establishment-context";

export default function EstablishmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstablishmentProvider>
      <EstablishmentShell>{children}</EstablishmentShell>
    </EstablishmentProvider>
  );
}
