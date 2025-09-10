import { useAuth } from '@/contexts/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRoles } from '@/hooks/useUserRoles';
import LeaderDashboardWidget from '@/components/dashboard/LeaderDashboardWidget';
import SupervisorDashboardWidget from '@/components/dashboard/SupervisorDashboardWidget';
import CoordinatorDashboardWidget from '@/components/dashboard/CoordinatorDashboardWidget';
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget';
import InsightsWidget from '@/components/dashboard/InsightsWidget';
import StatsCardsWidget from '@/components/dashboard/StatsCardsWidget';
import { startOfWeek, endOfWeek, startOfMonth } from "date-fns";

const fetchDashboardData = async () => {
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today).toISOString();
  const startOfWeekDay = startOfWeek(today, { weekStartsOn: 1 }).toISOString();
  const endOfWeekDay = endOfWeek(today, { weekStartsOn: 1 });

  // Promises for Stats
  const membersPromise = supabase.from('members').select('id', { count: 'exact', head: true });
  const eventsPromise = supabase.from('events').select('id', { count: 'exact', head: true }).gte('event_date', new Date().toISOString());
  const contributionsPromise = supabase.from('contributions').select('amount').gte('contribution_date', firstDayOfMonth);

  // Promises for Insights
  const visitorsPromise = supabase.from('visitors').select('id', { count: 'exact', head: true }).gte('created_at', startOfWeekDay);
  const counselingPromise = supabase.from('counseling_requests').select('id', { count: 'exact', head: true }).in('status', ['Pendente', 'Em Análise']);
  const birthdaysPromise = supabase.from('members').select('date_of_birth');

  const [
    { count: membersCount },
    { count: eventsCount },
    { data: contributions },
    { count: newVisitorsCount },
    { count: openCounselingCount },
    { data: allMembersForBirthdayCheck }
  ] = await Promise.all([membersPromise, eventsPromise, contributionsPromise, visitorsPromise, counselingPromise, birthdaysPromise]);

  const monthlyTotal = contributions?.reduce((sum, { amount }) => sum + amount, 0) || 0;

  const upcomingBirthdays = allMembersForBirthdayCheck?.filter(m => {
    if (!m.date_of_birth) return false;
    const birthDate = new Date(m.date_of_birth);
    const birthDayThisYear = new Date(today.getFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate());
    return birthDayThisYear >= new Date(startOfWeekDay) && birthDayThisYear <= endOfWeekDay;
  }).length || 0;

  return {
    stats: { membersCount, eventsCount, monthlyTotal },
    insights: { newVisitorsCount, openCounselingCount, upcomingBirthdays }
  };
};

const DashboardIndex = () => {
  const { session } = useAuth();
  const { data, isLoading: isLoadingData } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });
  const { 
    leaderCells, 
    supervisedCells, 
    coordinatedSupervisors,
    isLeader, 
    isSupervisor,
    isCoordinator,
    isLoading: isLoadingRoles 
  } = useUserRoles();

  const isLoading = isLoadingData || isLoadingRoles;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Painel de Gestão</h1>
        <p className="mt-2 text-muted-foreground">
          Bem-vindo, {session?.user?.user_metadata?.full_name || session?.user?.email}!
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <QuickActionsWidget />
        <InsightsWidget insights={data?.insights} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <StatsCardsWidget stats={data!.stats} isLoading={isLoading} />
        )}
      </div>

      {isLoadingRoles ? <Skeleton className="h-64 w-full" /> : (
        <>
          {isLeader && leaderCells.map(cell => <LeaderDashboardWidget key={cell.id} cell={cell} />)}
          {isSupervisor && <SupervisorDashboardWidget cells={supervisedCells} />}
          {isCoordinator && <CoordinatorDashboardWidget supervisors={coordinatedSupervisors} />}
        </>
      )}
    </div>
  );
};

export default DashboardIndex;