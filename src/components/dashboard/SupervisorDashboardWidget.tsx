import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Cell } from "@/types";

interface SupervisorDashboardWidgetProps {
  cells: Cell[];
}

const SupervisorDashboardWidget = ({ cells }: SupervisorDashboardWidgetProps) => {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Eye /> Células Supervisionadas</CardTitle>
        <CardDescription>Acompanhe o desenvolvimento das células sob sua supervisão.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Célula</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead>Dia do Encontro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cells.map(cell => (
              <TableRow key={cell.id}>
                <TableCell className="font-medium">{cell.name}</TableCell>
                <TableCell>{(cell as any).leader?.full_name || 'Não definido'}</TableCell>
                <TableCell>{cell.meeting_day}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/dashboard/cells/${cell.id}/reports`} className="text-sm text-primary hover:underline">
                    Ver Relatórios
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SupervisorDashboardWidget;