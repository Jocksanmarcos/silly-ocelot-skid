import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, HeartHandshake, Cake, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface InsightsWidgetProps {
  insights?: {
    newVisitorsCount: number | null;
    openCounselingCount: number | null;
    upcomingBirthdays: number;
  };
  isLoading: boolean;
}

const InsightsWidget = ({ insights, isLoading }: InsightsWidgetProps) => {
  if (isLoading) {
    return <Skeleton className="h-48 col-span-full md:col-span-2" />;
  }

  const insightItems = [
    { count: insights?.newVisitorsCount, text: "novo(s) visitante(s) esta semana.", icon: Users, link: "/dashboard/visitors" },
    { count: insights?.openCounselingCount, text: "pedido(s) de aconselhamento pendente(s).", icon: HeartHandshake, link: "/dashboard/aconselhamento" },
    { count: insights?.upcomingBirthdays, text: "aniversariante(s) esta semana.", icon: Cake, link: "/dashboard/members" },
  ];

  const activeInsights = insightItems.filter(i => i.count && i.count > 0);

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>Insights da Semana</CardTitle>
        <CardDescription>Sua atenção é necessária aqui.</CardDescription>
      </CardHeader>
      <CardContent>
        {activeInsights.length > 0 ? (
          <ul className="space-y-4">
            {activeInsights.map((insight, index) => (
              <li key={index}>
                <Link to={insight.link} className="flex items-center justify-between p-3 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-4">
                    <insight.icon className="h-6 w-6 text-primary" />
                    <div>
                      <span className="font-bold text-lg">{insight.count}</span>
                      <span className="text-muted-foreground"> {insight.text}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhuma ação urgente esta semana. Bom trabalho!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsWidget;