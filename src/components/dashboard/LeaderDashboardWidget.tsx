import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Cell } from "@/types";

interface LeaderDashboardWidgetProps {
  cell: Cell;
}

const LeaderDashboardWidget = ({ cell }: LeaderDashboardWidgetProps) => {
  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-1 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Home className="text-blue-600" /> Minha Célula: {cell.name}</CardTitle>
        <CardDescription>Gerencie os membros e relatórios do seu grupo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link to={`/dashboard/cells/${cell.id}/members`}><Users className="h-4 w-4" /> Gerenciar Membros</Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link to={`/dashboard/cells/${cell.id}/reports`}><FileText className="h-4 w-4" /> Enviar Relatórios</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeaderDashboardWidget;