import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cell, CellMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetchCellData = async (cellId: string) => {
  const cellPromise = supabase.from('cells').select('name').eq('id', cellId).single();
  const membersPromise = supabase.from('cell_members').select('*').eq('cell_id', cellId).order('created_at', { ascending: true });

  const [{ data: cell, error: cellError }, { data: members, error: membersError }] = await Promise.all([cellPromise, membersPromise]);

  if (cellError) throw new Error(`Erro ao buscar detalhes da célula: ${cellError.message}`);
  if (membersError) throw new Error(`Erro ao buscar membros da célula: ${membersError.message}`);
  
  return { cell, members };
};

const CellMembersPage = () => {
  const { id: cellId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cell_members', cellId],
    queryFn: () => fetchCellData(cellId!),
    enabled: !!cellId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string, status: string }) => {
      const { error } = await supabase.from('cell_members').update({ status }).eq('id', memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cell_members', cellId] });
      showSuccess('Status do membro atualizado!');
    },
    onError: (error: Error) => showError(error.message),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string, role: string }) => {
      const { error } = await supabase.from('cell_members').update({ role }).eq('id', memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cell_members', cellId] });
      showSuccess('Papel do membro atualizado!');
    },
    onError: (error: Error) => showError(error.message),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('cell_members').delete().eq('id', memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cell_members', cellId] });
      showSuccess('Membro removido da lista.');
    },
    onError: (error: Error) => showError(error.message),
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const { cell, members } = data || { cell: null, members: [] };

  return (
    <div>
      <Link to="/dashboard/cells" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Células
      </Link>
      <h1 className="text-3xl font-bold">Membros da Célula: {cell?.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Gerencie os participantes e interessados neste grupo.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Interessados e Membros</CardTitle>
          <CardDescription>{members?.length || 0} pessoa(s) encontrada(s).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Papel na Célula</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members && members.length > 0 ? (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.full_name}</TableCell>
                    <TableCell>{member.email || member.phone}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {member.status === 'approved' ? 'Aprovado' : 'Pendente'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member.status === 'approved' && member.user_id ? (
                        <Select value={member.role} onValueChange={(role) => updateRoleMutation.mutate({ memberId: member.id, role })}>
                          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Membro">Membro</SelectItem>
                            <SelectItem value="Líder em Treinamento">Líder em Treinamento</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : member.role}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {member.status === 'pending' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatusMutation.mutate({ memberId: member.id, status: 'approved' })}>
                          <Check className="h-4 w-4 mr-1" /> Aprovar
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" /> Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover {member.full_name} desta célula? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMemberMutation.mutate(member.id)}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Ninguém demonstrou interesse nesta célula ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CellMembersPage;