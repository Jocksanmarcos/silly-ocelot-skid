import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Hash, TrendingUp } from "lucide-react";

interface FinancialSummaryProps {
  totalRevenue: number;
  totalContributions: number;
}

const FinancialSummary = ({ totalRevenue, totalContributions }: FinancialSummaryProps) => {
  const averageContribution = totalContributions > 0 ? totalRevenue / totalContributions : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Arrecadação Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2).replace('.', ',')}</div>
          <p className="text-xs text-muted-foreground">no período selecionado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nº de Contribuições</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalContributions}</div>
          <p className="text-xs text-muted-foreground">registros no período</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contribuição Média</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {averageContribution.toFixed(2).replace('.', ',')}</div>
          <p className="text-xs text-muted-foreground">valor médio por registro</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;