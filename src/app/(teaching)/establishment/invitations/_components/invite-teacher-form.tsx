"use client";

import { useActionState, useId, type ComponentProps } from "react";
import { Send } from "lucide-react";
import { useTranslations, type Dictionary } from "@/lib/i18n/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import type { InviteTeacher, InviteTeacherState } from "@/types";
import { sendTeacherInvitationAction } from "@/app/(teaching)/_actions/establishment-actions";
import { useEstablishment } from "../../_contexts/establishment-context";
import { initialInviteTeacherState } from "../../state";

type InviteFormErrors = Dictionary["establishment"]["invitationsPage"]["form"]["errors"];

function getErrorMessage(errors: InviteFormErrors, code?: string | null) {
  if (!code) return undefined;
  return code in errors ? errors[code as keyof InviteFormErrors] : errors.defaultError;
}

type InviteFieldProps = Omit<ComponentProps<typeof Input>, "id"> & {
  id: string;
  fieldLabel: string;
  error?: string;
  errorId: string;
};

function InviteField({ id, fieldLabel, error, errorId, ...inputProps }: InviteFieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-[6px] block text-[12.5px] font-semibold text-zinc-700">
        {fieldLabel}
      </label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="h-auto rounded-[8px] border-border px-[12px] py-[10px] text-[14px] text-foreground aria-[invalid=true]:border-red-600 md:text-[14px]"
        {...inputProps}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-[6px] text-[12px] text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function InviteTeacherForm() {
  const t = useTranslations().establishment.invitationsPage;
  const { refreshInvitationTokens } = useEstablishment();
  const ids = {
    title: useId(),
    description: useId(),
    error: useId(),
    firstname: useId(),
    lastname: useId(),
    email: useId(),
    assignedChatbots: useId(),
  };
  const [state, formAction, isPending] = useActionState(async (prev: InviteTeacherState, formData: FormData) => {
    const next = await sendTeacherInvitationAction(prev, formData);
    console.log("🚀 ~ InviteTeacherForm ~ next:", next);

    if (next.invitedEmail && !next.error) {
      toast({
        title: t.form.success.title,
        description: t.form.success.description.replace("{email}", next.invitedEmail),
      });
      await refreshInvitationTokens();
    }

    return next;
  }, initialInviteTeacherState);

  const fieldProps = (field: keyof InviteTeacher) => ({
    id: ids[field],
    name: field,
    required: true,
    defaultValue: state.values[field],
    error: getErrorMessage(t.form.errors, state.fieldErrors[field]?.[0]),
    errorId: `${ids[field]}-error`,
  });

  const formError = getErrorMessage(t.form.errors, state.error);

  return (
    <section aria-labelledby={ids.title} className="mb-[32px]">
      <h2 id={ids.title} className="sr-only">
        {t.form.title}
      </h2>
      <p id={ids.description} className="mb-[20px] text-[13px] text-zinc-500">
        {t.description}
      </p>

      <form
        noValidate
        action={formAction}
        aria-describedby={ids.description}
        aria-busy={isPending}
        className="rounded-[12px] border border-border bg-background p-[24px]"
      >
        <div className="mb-[16px] grid grid-cols-2 gap-[16px]">
          <InviteField
            {...fieldProps("firstname")}
            fieldLabel={t.form.firstNameLabel}
            placeholder={t.form.firstNamePlaceholder}
            autoComplete="given-name"
          />
          <InviteField
            {...fieldProps("lastname")}
            fieldLabel={t.form.lastNameLabel}
            placeholder={t.form.lastNamePlaceholder}
            autoComplete="family-name"
          />
        </div>

        <div className="mb-[16px]">
          <InviteField
            {...fieldProps("email")}
            type="email"
            inputMode="email"
            fieldLabel={t.form.emailLabel}
            placeholder={t.form.emailPlaceholder}
            autoComplete="email"
          />
        </div>

        <div className="mb-[20px]">
          <InviteField
            {...fieldProps("assignedChatbots")}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            fieldLabel={t.form.assignedChatbotsLabel}
          />
        </div>

        <div className="flex items-center justify-between gap-[12px]">
          <p id={ids.error} role="alert" className="m-0 text-[12px] text-red-600">
            {formError}
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[8px] bg-primary px-[16px] py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            <Send aria-hidden className="h-[15px] w-[15px]" />
            {t.form.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
