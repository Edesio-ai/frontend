import { getLocaleFromCookies } from "@/lib/i18n";
import { getLegalNotice } from "@/data/legal";
import { LegalDocument } from "@/components/legal/LegalDocument";

export default async function LegalNotice() {
  const locale = await getLocaleFromCookies();
  return <LegalDocument content={getLegalNotice(locale)} />;
}
