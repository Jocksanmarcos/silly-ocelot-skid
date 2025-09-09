import { useLeaderCell } from "@/hooks/useLeaderCell";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CellMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { Check, Trash2, AlertCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LeaderMembersPage = () => {
  const queryClient = useQueryClient();
  const { cell, isLoading: isLoadingCell, isLeader } = useLeaderCell();

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['leader_cell_members', cell?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('cell_members').select('*').eq('cell_id', cell!.id).order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data as CellMember[];
    },
    enabled: !!cell,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string, status: string }) => {
      const { error } = await supabase.from('cell_members').update({ status }).eq('id', memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leader_cell_members', cell?.id] });
      showSuccess('Status do membro atualizado!');
    },
    onError: (error: Error) => showError(error.message),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('cell_members').delete().eq('id', memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leader_cell_members', cell?.id] });
      showSuccess('Membro removido da lista.');
    },
    onError: (error: Error) => showError(error.message),
  });

  if (isLoadingCell) return <Skeleton className="h-96 w-full" />;

  if (!isLeader || !cell) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Negado</AlertTitle>
        <AlertDescription>Você não tem permissão para acessar esta página.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Membros da Célula: {cell.name}</h1>
      <p className="mt-2 text-muted-foreground">Gerencie os participantes e interessados no seu grupo.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Membros</CardTitle>
          <CardDescription>{members?.length || 0} pessoa(s) encontrada(s).</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? <Skeleton className="h-40 w-full" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Telefone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {members && members.length > 0 ? (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell><span className={`px-2 py-1 text-xs rounded-full ${member.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{member.status === 'approved' ? 'Aprovado' : 'Pendente'}</span></TableCell>
                      <TableCell className="text-right space-x-2">
                        {member.status === 'pending' && <Button variant="outline" size="sm" onClick={() => updateStatusMutation.mutate({ memberId: member.id, status: 'approved' })}><Check className="h-4 w-4 mr-1" /> Aprovar</Button>}
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1" /> Remover</Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Confirmar Remoção</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover {member.full_name} desta célula?</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteMemberMutation.mutate(member.id)}>Confirmar</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum membro ou interessado encontrado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderMembersPage;