import { getLocaleFromCookies } from "@/lib/i18n";
import { getTermsOfService } from "@/data/legal";
import { LegalDocument } from "@/components/legal/LegalDocument";

export default async function TermsOfService() {
  const locale = await getLocaleFromCookies();
  return <LegalDocument content={getTermsOfService(locale)} />;
}
