import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, DollarSign } from "lucide-react";

interface StatsCardsWidgetProps {
  stats: {
    membersCount: number | null;
    eventsCount: number | null;
    monthlyTotal: number;
  };
  isLoading: boolean;
}

const StatsCardsWidget = ({ stats, isLoading }: StatsCardsWidgetProps) => {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Pessoas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.membersCount}</div>}
          <p className="text-xs text-muted-foreground">Pessoas cadastradas no sistema</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.eventsCount}</div>}
          <p className="text-xs text-muted-foreground">Eventos futuros agendados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contribuições (Mês)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">R$ {stats?.monthlyTotal.toFixed(2).replace('.', ',')}</div>}
          <p className="text-xs text-muted-foreground">Total arrecadado no mês atual</p>
        </CardContent>
      </Card>
    </>
  );
};

export default StatsCardsWidget;