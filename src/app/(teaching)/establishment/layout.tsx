import { EstablishmentProvider } from "./_contexts/establishment-context";

export default function EstablishmentLayout({ children }: { children: React.ReactNode }) {
  return <EstablishmentProvider>{children}</EstablishmentProvider>;
}
