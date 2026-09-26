import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { CELL_CLASS, ROW_CLASS } from "./teachers-table.styles";

export function TeachersTableSkeleton({ rows = 3 }: { rows?: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <TableRow key={index} className={ROW_CLASS}>
      <TableCell className={CELL_CLASS}>
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[34px] w-[34px] shrink-0 rounded-full" />
          <div className="flex flex-col gap-[6px]">
            <Skeleton className="h-[14px] w-[140px]" />
            <Skeleton className="h-[12px] w-[180px]" />
          </div>
        </div>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <Skeleton className="h-[14px] w-[24px]" />
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <Skeleton className="h-[14px] w-[24px]" />
      </TableCell>
      <TableCell className={CELL_CLASS}>
        <Skeleton className="h-[22px] w-[56px] rounded-full" />
      </TableCell>
      <TableCell className={CELL_CLASS} />
    </TableRow>
  ));
}
