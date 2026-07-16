import { getLocaleFromCookies } from "@/lib/i18n";
import { getPrivacyPolicy } from "@/data/legal";
import { LegalDocument } from "@/components/legal/LegalDocument";

export default async function PrivacyPolicy() {
  const locale = await getLocaleFromCookies();
  return <LegalDocument content={getPrivacyPolicy(locale)} />;
}
