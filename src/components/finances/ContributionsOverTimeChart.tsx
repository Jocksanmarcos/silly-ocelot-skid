import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contribution } from "@/types";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContributionsOverTimeChartProps {
  contributions: Contribution[];
}

const ContributionsOverTimeChart = ({ contributions }: ContributionsOverTimeChartProps) => {
  const chartData = useMemo(() => {
    const dataByMonth: { [key: string]: number } = {};
    contributions.forEach(c => {
      const monthYear = format(new Date(c.contribution_date), 'MMM/yy', { locale: ptBR });
      dataByMonth[monthYear] = (dataByMonth[monthYear] || 0) + c.amount;
    });

    const sortedKeys = Object.keys(dataByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        const dateA = new Date(Number(`20${yearA}`), ptBR.localize?.month(ptBR.months.findIndex(m => m.startsWith(monthA))) , 1);
        const dateB = new Date(Number(`20${yearB}`), ptBR.localize?.month(ptBR.months.findIndex(m => m.startsWith(monthB))) , 1);
        return dateA.getTime() - dateB.getTime();
    });

    return sortedKeys.map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      "Arrecadação": dataByMonth[key],
    }));
  }, [contributions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arrecadação Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
            <Legend />
            <Bar dataKey="Arrecadação" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ContributionsOverTimeChart;