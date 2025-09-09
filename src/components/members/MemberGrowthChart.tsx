import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Member } from "@/types";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MemberGrowthChartProps {
  members: Member[];
}

const MemberGrowthChart = ({ members }: MemberGrowthChartProps) => {
  const chartData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    members.forEach(member => {
      if (member.membership_date) {
        const date = new Date(member.membership_date);
        const monthYear = `${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
        counts[monthYear] = (counts[monthYear] || 0) + 1;
      }
    });

    const sortedKeys = Object.keys(counts).sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      return new Date(`${yearA}-${monthA}-01`).getTime() - new Date(`${yearB}-${monthB}-01`).getTime();
    });

    return sortedKeys.map(key => ({
      name: key,
      "Novos Membros": counts[key],
    }));

  }, [members]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento de Membros</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Novos Membros" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MemberGrowthChart;