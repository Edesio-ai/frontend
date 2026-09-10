import { EstablishmentAside } from "./_components/establishment-aside";
import { EstablishmentProvider } from "./_contexts/establishment-context";

export default function EstablishmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstablishmentProvider>
      <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-foreground">
        <EstablishmentAside />
        <main className="flex-1">{children}</main>
      </div>
    </EstablishmentProvider>
  );
}
