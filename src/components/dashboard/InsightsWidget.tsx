import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, HeartHandshake, Cake, ArrowRight } from "lucide-react";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { Link } from "react-router-dom";

const fetchInsights = async () => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 }).toISOString();
  
  const visitorsPromise = supabase
    .from('visitors')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', start);

  const counselingPromise = supabase
    .from('counseling_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['Pendente', 'Em Análise']);

  const birthdaysPromise = supabase
    .from('members')
    .select('first_name, last_name, date_of_birth')
    .limit(5); // Limit to avoid fetching all members

  const [
    { count: newVisitorsCount },
    { count: openCounselingCount },
    { data: members }
  ] = await Promise.all([visitorsPromise, counselingPromise, birthdaysPromise]);

  // Manual filtering for birthdays this week
  const startD = startOfWeek(today, { weekStartsOn: 1 });
  const endD = endOfWeek(today, { weekStartsOn: 1 });
  const upcomingBirthdays = members?.filter(m => {
    if (!m.date_of_birth) return false;
    const birthDate = new Date(m.date_of_birth);
    const birthDayThisYear = new Date(today.getFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate());
    return birthDayThisYear >= startD && birthDayThisYear <= endD;
  }).length || 0;

  return { newVisitorsCount, openCounselingCount, upcomingBirthdays };
};

const InsightsWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardInsights'],
    queryFn: fetchInsights,
  });

  if (isLoading) {
    return <Skeleton className="h-48 col-span-full md:col-span-2" />;
  }

  const insights = [
    { count: data?.newVisitorsCount, text: "novo(s) visitante(s) esta semana.", icon: Users, link: "/dashboard/visitors" },
    { count: data?.openCounselingCount, text: "pedido(s) de aconselhamento pendente(s).", icon: HeartHandshake, link: "/dashboard/aconselhamento" },
    { count: data?.upcomingBirthdays, text: "aniversariante(s) esta semana.", icon: Cake, link: "/dashboard/members/dashboard" },
  ];

  const activeInsights = insights.filter(i => i.count && i.count > 0);

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