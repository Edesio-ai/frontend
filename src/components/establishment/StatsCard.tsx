import { Building2 } from "lucide-react";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export  function StatsCard({
    title,
    value,
    icon: Icon,
    loading,
  }: {
    title: string;
    value: number;
    icon: typeof Building2;
    loading: boolean;
  }) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {value}
              </p>
            )}
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </Card>
    );
  }