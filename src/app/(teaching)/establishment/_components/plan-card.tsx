type PlanCardProps = {
  planName: string;
  icon: React.ReactNode;
};

export function PlanCard({ planName, icon }: PlanCardProps) {
  return (
    <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-border bg-zinc-50 px-4 py-4">
      {icon}
      <span className="text-[13.5px] font-semibold text-foreground">{planName}</span>
    </div>
  );
}
