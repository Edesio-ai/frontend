import { cn } from "@/lib/utils";

export const TEACHERS_TABLE_COLUMNS_COUNT = 5;

export const CELL_CLASS = "px-[6px] first:pl-[20px] last:pr-[20px]";

export const HEAD_CLASS = cn(
  CELL_CLASS,
  "h-auto py-[12px] text-[12px] font-semibold uppercase tracking-[0.04em] text-zinc-500",
);

export const ROW_CLASS = "border-zinc-100 hover:bg-transparent [&>td]:py-[16px]";
