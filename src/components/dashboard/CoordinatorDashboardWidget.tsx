import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Cell, Profile } from "@/types";

type SupervisorWithCells = Profile & { cells: Cell[] };

interface CoordinatorDashboardWidgetProps {
  supervisors: SupervisorWithCells[];
}

const CoordinatorDashboardWidget = ({ supervisors }: CoordinatorDashboardWidgetProps) => {
  const totalCells = supervisors.reduce((sum, s) => sum + s.cells.length, 0);

  return (
    <Card className="col-span-full bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Briefcase className="text-purple-600" /> Meu Setor</CardTitle>
        <CardDescription>
          Você coordena {supervisors.length} supervisor(es), com um total de {totalCells} célula(s).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {supervisors.map(supervisor => (
            <AccordionItem value={supervisor.id} key={supervisor.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{supervisor.full_name} ({supervisor.cells.length} células)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  {supervisor.cells.map(cell => (
                    <li key={cell.id}>
                      <Link to={`/dashboard/cells/${cell.id}/reports`} className="text-sm text-primary hover:underline">
                        {cell.name} (Líder: {(cell as any).leader?.full_name || 'N/D'})
                      </Link>
                    </li>
                  ))}
                  {supervisor.cells.length === 0 && <li className="text-sm text-muted-foreground">Nenhuma célula sob esta supervisão.</li>}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CoordinatorDashboardWidget;