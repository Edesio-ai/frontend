import { EstablishmentLayoutGate } from "./_components/establishment-layout-gate";
import { EstablishmentProvider } from "./_contexts/establishment-context";

export default function EstablishmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstablishmentProvider>
      <EstablishmentLayoutGate>{children}</EstablishmentLayoutGate>
    </EstablishmentProvider>
  );
}
