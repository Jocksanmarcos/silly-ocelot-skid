import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Cell, Profile } from '@/types';

type SupervisorWithCells = Profile & { cells: Cell[] };

const fetchUserRoles = async (userId: string) => {
  // 1. Buscar células onde o usuário é líder ou supervisor direto
  const { data: directCells, error: directCellsError } = await supabase
    .from('cells')
    .select('*, leader:profiles!leader_id(full_name), supervisor:profiles!supervisor_id(full_name)')
    .or(`leader_id.eq.${userId},supervisor_id.eq.${userId}`);
  if (directCellsError) throw new Error(directCellsError.message);

  const leaderCells = directCells.filter(cell => cell.leader_id === userId);
  const supervisedCells = directCells.filter(cell => cell.supervisor_id === userId);

  // 2. Verificar se o usuário é coordenador, buscando supervisores que se reportam a ele
  const { data: supervisors, error: supervisorsError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('reports_to_id', userId);
  if (supervisorsError) throw new Error(supervisorsError.message);

  let coordinatedSupervisors: SupervisorWithCells[] = [];
  if (supervisors && supervisors.length > 0) {
    const supervisorIds = supervisors.map(s => s.id);
    // 3. Buscar todas as células dos supervisores coordenados
    const { data: coordinatedCells, error: coordinatedCellsError } = await supabase
      .from('cells')
      .select('*, leader:profiles!leader_id(full_name)')
      .in('supervisor_id', supervisorIds);
    if (coordinatedCellsError) throw new Error(coordinatedCellsError.message);

    // Agrupar células por supervisor
    coordinatedSupervisors = supervisors.map(supervisor => ({
      ...supervisor,
      cells: coordinatedCells?.filter(cell => cell.supervisor_id === supervisor.id) || [],
    }));
  }

  return { leaderCells, supervisedCells, coordinatedSupervisors };
};

export const useUserRoles = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userRoles', userId],
    queryFn: () => fetchUserRoles(userId!),
    enabled: !!userId,
  });

  return {
    leaderCells: data?.leaderCells || [],
    supervisedCells: data?.supervisedCells || [],
    coordinatedSupervisors: data?.coordinatedSupervisors || [],
    isLeader: (data?.leaderCells?.length || 0) > 0,
    isSupervisor: (data?.supervisedCells?.length || 0) > 0,
    isCoordinator: (data?.coordinatedSupervisors?.length || 0) > 0,
    isLoading,
    isError,
  };
};