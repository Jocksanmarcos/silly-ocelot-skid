import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRoles } from '@/hooks/useUserRoles';
import LeaderDashboardWidget from '@/components/dashboard/LeaderDashboardWidget';
import SupervisorDashboardWidget from '@/components/dashboard/SupervisorDashboardWidget';
import CoordinatorDashboardWidget from '@/components/dashboard/CoordinatorDashboardWidget';
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget';
import InsightsWidget from '@/components/dashboard/InsightsWidget';

const fetchDashboardStats = async () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const membersPromise = supabase.from('members').select('id', { count: 'exact', head: true });
  const eventsPromise = supabase.from('events').select('id', { count: 'exact', head: true }).gte('event_date', new Date().toISOString());
  const contributionsPromise = supabase.from('contributions').select('amount').gte('contribution_date', firstDayOfMonth);

  const [
    { count: membersCount, error: membersError },
    { count: eventsCount, error: eventsError },
    { data: contributions, error: contributionsError }
  ] = await Promise.all([membersPromise, eventsPromise, contributionsPromise]);

  if (membersError || eventsError || contributionsError) {
    console.error(membersError || eventsError || contributionsError);
    throw new Error('Erro ao buscar dados para o painel.');
  }

  const monthlyTotal = contributions?.reduce((sum, { amount }) => sum + amount, 0) || 0;

  return { membersCount, eventsCount, monthlyTotal };
};

const DashboardIndex = () => {
  const { session } = useAuth();
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
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

  const isLoading = isLoadingStats || isLoadingRoles;

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
        <InsightsWidget />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? <Skeleton className="h-48 col-span-full" /> : (
          <>
            {isLeader && leaderCells.map(cell => <LeaderDashboardWidget key={cell.id} cell={cell} />)}
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pessoas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.membersCount}</div>}
            <p className="text-xs text-muted-foreground">Pessoas cadastradas no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.eventsCount}</div>}
            <p className="text-xs text-muted-foreground">Eventos futuros agendados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribuições (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">R$ {stats?.monthlyTotal.toFixed(2).replace('.', ',')}</div>}
            <p className="text-xs text-muted-foreground">Total arrecadado no mês atual</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <>
          {isSupervisor && <SupervisorDashboardWidget cells={supervisedCells} />}
          {isCoordinator && <CoordinatorDashboardWidget supervisors={coordinatedSupervisors} />}
        </>
      )}
    </div>
  );
};

export default DashboardIndex;