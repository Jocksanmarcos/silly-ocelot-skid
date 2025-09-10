import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';

const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .order('full_name', { ascending: true });
  
  if (error) throw new Error(error.message);
  return data;
};

const userRoles: UserRole[] = ['super_admin', 'admin_missao', 'pastor', 'lider_celula', 'membro'];

const PermissionsPage = () => {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profilesPermissions'],
    queryFn: fetchProfiles,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profilesPermissions'] });
      showSuccess('Cargo atualizado com sucesso!');
    },
    onError: (error: Error) => {
      showError(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateMutation.mutate({ userId, role });
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Gestão de Cargos</h3>
        <p className="text-sm text-muted-foreground">
          Atribua o nível de permissão correto para cada usuário da plataforma.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Usuário</TableHead>
            <TableHead>Cargo / Permissão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles?.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">{profile.full_name}</TableCell>
              <TableCell>
                <Select
                  value={profile.role}
                  onValueChange={(value: UserRole) => handleRoleChange(profile.id, value)}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Selecione um cargo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionsPage;