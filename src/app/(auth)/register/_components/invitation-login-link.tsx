import Link from "next/link";
import { useTranslations } from "@/lib/i18n/client";

export function InvitationLoginLink() {
  const t = useTranslations().auth.register.new;

  return (
    <p className="text-center text-[13.5px] text-tertiary-foreground">
      {t.alreadyHaveAccount}{" "}
      <Link href="/login" className="font-semibold text-primary no-underline hover:text-primary/80">
        {t.login}
      </Link>
    </p>
  );
}
