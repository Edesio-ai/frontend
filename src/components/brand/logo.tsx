import { cn } from "@/lib/utils";

const MARK_SIZES = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-14 w-14",
} as const;

type LogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  size?: keyof typeof MARK_SIZES;
  mark?: boolean;
  wordmark?: boolean;
  alt?: string;
};

export function Logo({
  className,
  markClassName,
  wordmarkClassName,
  size = "md",
  mark = true,
  wordmark = true,
  alt,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {mark ? (
        <img
          src="/edesio-logo-square.png"
          alt={alt ?? (wordmark ? "" : "Edesio")}
          className={cn(MARK_SIZES[size], "rounded-lg object-cover brand:rounded-none", markClassName)}
        />
      ) : null}
      {wordmark ? (
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent brand:bg-none brand:bg-clip-padding brand:text-foreground brand:font-extrabold",
            wordmarkClassName,
          )}
        >
          Edesio
        </span>
      ) : null}
    </span>
  );
}
