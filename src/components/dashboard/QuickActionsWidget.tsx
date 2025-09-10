import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CalendarPlus, DollarSign, Home } from "lucide-react";
import { Link } from "react-router-dom";

const QuickActionsWidget = () => {
  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button asChild variant="outline">
          <Link to="/dashboard/members">
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Pessoa
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/events">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Criar Evento
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/finances">
            <DollarSign className="mr-2 h-4 w-4" />
            Lançar Finanças
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/cells">
            <Home className="mr-2 h-4 w-4" />
            Nova Célula
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsWidget;