import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CellMember, CellReport } from '@/types';
import { CellReportFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { Check, Trash2, PlusCircle } from 'lucide-react';
import CellReportForm from './CellReportForm';

interface CellDetailsDialogProps {
  cellId: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const fetchCellDetails = async (cellId: string) => {
  const membersPromise = supabase.from('cell_members').select('*').eq('cell_id', cellId).order('created_at', { ascending: true });
  const reportsPromise = supabase.from('cell_reports').select('*').eq('cell_id', cellId).order('meeting_date', { ascending: false });
  const [{ data: members }, { data: reports }] = await Promise.all([membersPromise, reportsPromise]);
  return { members, reports };
};

const CellDetailsDialog = ({ cellId, isOpen, onOpenChange }: CellDetailsDialogProps) => {
  const queryClient = useQueryClient();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cellDetails', cellId],
    queryFn: () => fetchCellDetails(cellId!),
    enabled: !!cellId && isOpen,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string, status: string }) => {
      const { error } = await supabase.from('cell_members').update({ status }).eq('id', memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cellDetails', cellId] }); showSuccess('Status atualizado!'); },
    onError: (error: Error) => showError(error.message),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('cell_members').delete().eq('id', memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cellDetails', cellId] }); showSuccess('Membro removido.'); },
    onError: (error: Error) => showError(error.message),
  });

  const addReportMutation = useMutation({
    mutationFn: async (formData: CellReportFormValues) => {
      const { error } = await supabase.from('cell_reports').insert({ cell_id: cellId, ...formData });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cellDetails', cellId] });
      showSuccess('Relatório adicionado!');
      setIsReportDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Célula</DialogTitle>
          <DialogDescription>Gerencie membros e relatórios do grupo.</DialogDescription>
        </DialogHeader>
        {isLoading ? <Skeleton className="h-96 w-full" /> : (
          <Tabs defaultValue="members">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Membros ({data?.members?.length || 0})</TabsTrigger>
              <TabsTrigger value="reports">Relatórios ({data?.reports?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="members">
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Contato</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data?.members?.map((member: CellMember) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.email || member.phone}</TableCell>
                      <TableCell><span className={`px-2 py-1 text-xs rounded-full ${member.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{member.status === 'approved' ? 'Aprovado' : 'Pendente'}</span></TableCell>
                      <TableCell className="text-right space-x-2">
                        {member.status === 'pending' && <Button size="sm" onClick={() => updateStatusMutation.mutate({ memberId: member.id, status: 'approved' })}><Check className="h-4 w-4" /></Button>}
                        <Button variant="destructive" size="sm" onClick={() => deleteMemberMutation.mutate(member.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="reports">
              <div className="flex justify-end mb-4">
                <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                  <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Relatório</Button></DialogTrigger>
                  <DialogContent><DialogHeader><DialogTitle>Novo Relatório</DialogTitle></DialogHeader><CellReportForm onSubmit={(data) => addReportMutation.mutate(data)} isSubmitting={addReportMutation.isPending} /></DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Presentes</TableHead><TableHead>Anotações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data?.reports?.map((report: CellReport) => (
                    <TableRow key={report.id}>
                      <TableCell>{new Date(report.meeting_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell>{report.attendance_count}</TableCell>
                      <TableCell className="max-w-sm truncate">{report.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CellDetailsDialog;