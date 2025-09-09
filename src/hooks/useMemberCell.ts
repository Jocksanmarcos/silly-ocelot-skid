import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Cell, CellMember, Profile } from '@/types';

type MemberCellData = Cell & {
  leader: Profile | null;
  members: (CellMember & { profiles: Profile | null })[];
};

const fetchMemberCell = async (userId: string): Promise<MemberCellData | null> => {
  const { data: cellMember, error: cellMemberError } = await supabase
    .from('cell_members')
    .select('cell_id')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .single();

  if (cellMemberError || !cellMember) {
    if (cellMemberError && cellMemberError.code !== 'PGRST116') {
      console.error(cellMemberError);
    }
    return null;
  }

  const { cell_id } = cellMember;

  const { data: cellData, error: cellError } = await supabase
    .from('cells')
    .select(`
      *,
      leader:profiles!leader_id(full_name, avatar_url),
      members:cell_members!cell_id(
        *,
        profiles:profiles!user_id(full_name, avatar_url)
      )
    `)
    .eq('id', cell_id)
    .eq('members.status', 'approved')
    .single();

  if (cellError) {
    throw new Error(cellError.message);
  }

  return cellData as MemberCellData;
};

export const useMemberCell = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['memberCell', userId],
    queryFn: () => fetchMemberCell(userId!),
    enabled: !!userId,
  });
};