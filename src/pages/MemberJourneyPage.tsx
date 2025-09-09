import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Cell, CellMember, Enrollment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserPlus, GraduationCap, Home, Briefcase } from 'lucide-react';
import { useMemo } from 'react';

type JourneyData = {
  profiles: Profile[];
  cells: Cell[];
  cellMembers: CellMember[];
  enrollments: Enrollment[];
};

const fetchJourneyData = async (): Promise<JourneyData> => {
  const profilesPromise = supabase.from('profiles').select('*');
  const cellsPromise = supabase.from('cells').select('*');
  const cellMembersPromise = supabase.from('cell_members').select('*').eq('status', 'approved');
  const enrollmentsPromise = supabase.from('enrollments').select('*');

  const [
    { data: profiles, error: profilesError },
    { data: cells, error: cellsError },
    { data: cellMembers, error: cellMembersError },
    { data: enrollments, error: enrollmentsError },
  ] = await Promise.all([profilesPromise, cellsPromise, cellMembersPromise, enrollmentsPromise]);

  if (profilesError || cellsError || cellMembersError || enrollmentsError) {
    throw new Error('Erro ao buscar dados da jornada.');
  }

  return { profiles: profiles || [], cells: cells || [], cellMembers: cellMembers || [], enrollments: enrollments || [] };
};

const getJourneyStage = (profile: Profile, data: JourneyData) => {
  if (data.cells.some(c => c.supervisor_id === profile.id)) return { stage: 'Supervisor', variant: 'destructive' };
  if (data.cells.some(c => c.leader_id === profile.id)) return { stage: 'Líder de Célula', variant: 'destructive' };
  
  const cellMembership = data.cellMembers.find(cm => cm.user_id === profile.id);
  if (cellMembership?.role === 'Líder em Treinamento') return { stage: 'Líder em Treinamento', variant: 'secondary' };
  
  const hasEnrollment = data.enrollments.some(e => e.user_id === profile.id);
  if (hasEnrollment) return { stage: 'Discípulo em Formação', variant: 'default' };
  
  if (cellMembership) return { stage: 'Membro em Célula', variant: 'default' };

  return { stage: 'Membro Novo', variant: 'outline' };
};

const MemberJourneyPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['memberJourney'],
    queryFn: fetchJourneyData,
  });

  const journeyStats = useMemo(() => {
    const stats = {
      'Membro Novo': 0,
      'Membro em Célula': 0,
      'Discípulo em Formação': 0,
      'Líder em Treinamento': 0,
      'Líder de Célula': 0,
      'Supervisor': 0,
    };
    if (!data) return stats;
    data.profiles.forEach(p => {
      const { stage } = getJourneyStage(p, data);
      if (stats.hasOwnProperty(stage)) {
        stats[stage as keyof typeof stats]++;
      }
    });
    return stats;
  }, [data]);

  if (isLoading) {
    return <div><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jornada do Membro</h1>
        <p className="mt-2 text-muted-foreground">Acompanhe o desenvolvimento e a jornada de discipulado de cada membro.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Membros Novos</CardTitle><UserPlus className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{journeyStats['Membro Novo']}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Em Células</CardTitle><Home className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{journeyStats['Membro em Célula']}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Em Formação</CardTitle><GraduationCap className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{journeyStats['Discípulo em Formação']}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Em Treinamento</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{journeyStats['Líder em Treinamento']}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Líderes</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{journeyStats['Líder de Célula']}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Supervisores</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{journeyStats['Supervisor']}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Estágio da Jornada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.profiles.map(profile => {
                const { stage, variant } = getJourneyStage(profile, data);
                return (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell><Badge variant={variant as any}>{stage}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberJourneyPage;