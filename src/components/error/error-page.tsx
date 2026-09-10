"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export type ErrorPageProps = {
  status: number | string;
  message: string;
  title?: string;
  details?: string;
  onRetry?: () => void;
};

export function ErrorPage({ status, message, title, details, onRetry }: ErrorPageProps) {
  const t = useTranslations();
  const codeLabel = t.errorPage.codeLabel.replace("{status}", String(status));
  const heading = title ?? t.errorPage.defaultTitle;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  };

  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-[#FAFAFA] px-6 py-12 font-sans text-[#18181B]"
      data-testid="error-page"
    >
      <div className="w-full max-w-[420px]">
        <div className="mb-5 flex size-11 items-center justify-center rounded-[11px] border border-[#FBD5D5] bg-[#FEE2E2]">
          <AlertTriangle className="size-5 text-[#DC2626]" strokeWidth={2} />
        </div>

        <p className="mb-2 text-[12.5px] font-bold tracking-[0.02em] text-[#DC2626]" data-testid="error-page-status">
          {codeLabel}
        </p>
        <h1 className="mb-3 text-[22px] font-extrabold leading-[1.3] tracking-[-0.02em]">{heading}</h1>
        <p className="mb-6 text-sm leading-[1.6] text-[#71717A]" data-testid="error-page-message">
          {message}
        </p>

        {details ? (
          <div className="mb-6 rounded-[10px] border border-[#E4E4E7] bg-white px-4 py-3.5">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.04em] text-[#A1A1AA]">
              {t.errorPage.detailsLabel}
            </p>
            <p
              className="break-words font-mono text-[12.5px] leading-[1.5] text-[#52525B]"
              data-testid="error-page-details"
            >
              {details}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 rounded-[9px] border-none bg-[#18181B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#27272A]"
          data-testid="button-error-page-retry"
        >
          <RefreshCw className="size-[15px]" strokeWidth={2} />
          {t.errorPage.retry}
        </button>

        <p className="mt-6 text-xs text-[#A1A1AA]">
          {t.errorPage.contactHint}{" "}
          <a
            href={`mailto:${t.errorPage.contactEmail}`}
            className="font-semibold text-[#18181B] no-underline hover:underline"
          >
            {t.errorPage.contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
