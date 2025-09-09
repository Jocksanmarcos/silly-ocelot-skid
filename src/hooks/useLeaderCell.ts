import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Cell } from '@/types';

const fetchLeaderCell = async (userId: string): Promise<Cell | null> => {
  const { data, error } = await supabase
    .from('cells')
    .select('*, profiles(full_name)')
    .eq('leader_id', userId)
    .single();

  // error.code 'PGRST116' means no rows found, which is a valid case for a non-leader.
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data;
};

export const useLeaderCell = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: cell, isLoading, isError } = useQuery({
    queryKey: ['leaderCell', userId],
    queryFn: () => fetchLeaderCell(userId!),
    enabled: !!userId,
  });

  return {
    cell,
    isLoading,
    isError,
    isLeader: !!cell,
  };
};