import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';

type ProfileWithManager = Profile & {
  reports_to_id: string | null;
  manager: { full_name: string } | null;
};

const fetchProfiles = async (): Promise<ProfileWithManager[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, reports_to_id, manager:profiles!reports_to_id(full_name)')
    .order('full_name', { ascending: true });
  
  if (error) throw new Error(error.message);
  return data as ProfileWithManager[];
};

const HierarchyPage = () => {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profilesHierarchy'],
    queryFn: fetchProfiles,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, managerId }: { userId: string; managerId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ reports_to_id: managerId })
        .eq('id', userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profilesHierarchy'] });
      showSuccess('Hierarquia atualizada com sucesso!');
    },
    onError: (error: Error) => {
      showError(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleManagerChange = (userId: string, managerId: string) => {
    const newManagerId = managerId === 'null' ? null : managerId;
    updateMutation.mutate({ userId, managerId: newManagerId });
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-6" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Gestão de Hierarquia</h1>
      <p className="mt-2 text-muted-foreground">
        Defina a estrutura de liderança da igreja, designando quem se reporta a quem.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Estrutura de Liderança</CardTitle>
          <CardDescription>
            Para cada membro, selecione o líder a quem ele se reporta diretamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Membro</TableHead>
                <TableHead>Reporta-se a</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name}</TableCell>
                  <TableCell>
                    <Select
                      value={profile.reports_to_id || 'null'}
                      onValueChange={(value) => handleManagerChange(profile.id, value)}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Selecione um líder..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Ninguém (Nível Superior)</SelectItem>
                        {profiles
                          .filter(p => p.id !== profile.id)
                          .map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.full_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HierarchyPage;