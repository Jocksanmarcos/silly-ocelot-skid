import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Cell } from '@/types';

const fetchUserRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('cells')
    .select('*, leader:profiles!leader_id(full_name), supervisor:profiles!supervisor_id(full_name)')
    .or(`leader_id.eq.${userId},supervisor_id.eq.${userId}`);

  if (error) {
    throw new Error(error.message);
  }

  const leaderCells = data.filter(cell => cell.leader_id === userId);
  const supervisedCells = data.filter(cell => cell.supervisor_id === userId);

  return { leaderCells, supervisedCells };
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
    isLeader: (data?.leaderCells?.length || 0) > 0,
    isSupervisor: (data?.supervisedCells?.length || 0) > 0,
    isLoading,
    isError,
  };
};