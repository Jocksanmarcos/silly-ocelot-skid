import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contribution } from "@/types";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ContributionsByFundChartProps {
  contributions: Contribution[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const ContributionsByFundChart = ({ contributions }: ContributionsByFundChartProps) => {
  const chartData = useMemo(() => {
    const dataByFund: { [key: string]: number } = {};
    contributions.forEach(c => {
      dataByFund[c.fund] = (dataByFund[c.fund] || 0) + c.amount;
    });
    return Object.entries(dataByFund).map(([name, value]) => ({ name, value }));
  }, [contributions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Fundo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ContributionsByFundChart;