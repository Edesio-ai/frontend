"use client";

import { Check, Circle } from "lucide-react";
import { getPasswordCriteria, type PasswordCriteria } from "@/lib/password-criteria";

type PasswordCriteriaListProps = {
  password: string;
  confirmPassword: string;
  labels: Record<keyof PasswordCriteria, string>;
};

export function PasswordCriteriaList({ password, confirmPassword, labels }: PasswordCriteriaListProps) {
  const criteria = getPasswordCriteria(password, confirmPassword);
  const items: { key: keyof PasswordCriteria; met: boolean }[] = [
    { key: "minLength", met: criteria.minLength },
    { key: "uppercase", met: criteria.uppercase },
    { key: "lowercase", met: criteria.lowercase },
    { key: "number", met: criteria.number },
    { key: "special", met: criteria.special },
    { key: "match", met: criteria.match },
  ];

  return (
    <ul className="mt-2 space-y-1" data-testid="password-criteria-list">
      {items.map(({ key, met }) => (
        <li
          key={key}
          className={`flex items-center gap-2 text-xs ${met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
          data-testid={`password-criterion-${key}`}
          data-met={met ? "true" : "false"}
        >
          {met ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
          <span>{labels[key]}</span>
        </li>
      ))}
    </ul>
  );
}
