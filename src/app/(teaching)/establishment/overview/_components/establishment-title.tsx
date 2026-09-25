import { useLocale } from "@/lib/i18n/client";
import { Establishment } from "@/types";
import { formatFullDate } from "@/utils/functions/date.utils";
import { getInitials } from "@/utils/functions/string.utils";

export default function EstablishmentTitle({ establishment }: { establishment: Establishment | null }) {
  const locale = useLocale();
  const date = formatFullDate(new Date(), locale);

  return (
    <div className="flex items-center gap-[16px] mb-[36px]">
      <div className="w-[52px] h-[52px] rounded-[12px] bg-primary-muted text-primary-hover flex items-center justify-center text-[16px] font-extrabold tracking-[0.02em] shrink-0">
        {getInitials(establishment?.name, { max: 3 })}
      </div>
      <div>
        <p className="text-[12px] mb-[2px] text-landing-subtle">{date}</p>
        <p className="text-[22px] m-0 font-bold tracking-[-0.01em]">{establishment?.name ?? "N/A"}</p>
        <p className="text-[13px] mt-[2px] font-semibold text-tertiary-foreground">
          Académie de {establishment?.address?.city ?? "N/A"}
        </p>
      </div>
    </div>
  );
}
