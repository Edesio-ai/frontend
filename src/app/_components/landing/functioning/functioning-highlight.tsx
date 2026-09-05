import { cn } from "@/lib/utils";

type FunctioningHighlightProps = {
  title: string;
  description: string;
  isLast?: boolean;
};

export function FunctioningHighlight({ title, description, isLast = false }: FunctioningHighlightProps) {
  return (
    <div className={cn("px-6.5 py-5.5", !isLast && "border-b border-border md:border-r md:border-b-0")}>
      <p className="mb-1 text-sm font-bold text-foreground">{title}</p>
      <p className="text-[13px] leading-[1.6] text-tertiary-foreground">{description}</p>
    </div>
  );
}
