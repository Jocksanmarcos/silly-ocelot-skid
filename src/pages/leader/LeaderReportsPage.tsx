import { useState } from 'react';
import { useLeaderCell } from "@/hooks/useLeaderCell";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CellReport } from '@/types';
import { CellReportFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { PlusCircle, AlertCircle } from 'lucide-react';
import CellReportForm from '@/components/cells/CellReportForm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LeaderReportsPage = () => {
  const queryClient = useQueryClient();
  const { cell, isLoading: isLoadingCell, isLeader } = useLeaderCell();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['leader_cell_reports', cell?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('cell_reports').select('*').eq('cell_id', cell!.id).order('meeting_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data as CellReport[];
    },
    enabled: !!cell,
  });

  const addReportMutation = useMutation({
    mutationFn: async (formData: CellReportFormValues) => {
      const { error } = await supabase.from('cell_reports').insert({ cell_id: cell!.id, ...formData });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leader_cell_reports', cell?.id] });
      showSuccess('Relatório adicionado com sucesso!');
      setIsDialogOpen(false);
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios da Célula: {cell.name}</h1>
          <p className="mt-2 text-muted-foreground">Visualize e adicione os relatórios de encontros.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Relatório</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Relatório de Encontro</DialogTitle></DialogHeader>
            <CellReportForm onSubmit={(data) => addReportMutation.mutate(data)} isSubmitting={addReportMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Encontros</CardTitle>
          <CardDescription>{reports?.length || 0} relatório(s) encontrado(s).</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReports ? <Skeleton className="h-40 w-full" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Presentes</TableHead><TableHead>Anotações</TableHead></TableRow></TableHeader>
              <TableBody>
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{new Date(report.meeting_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell>{report.attendance_count}</TableCell>
                      <TableCell className="max-w-sm truncate">{report.notes}</TableCell>
                    </TableRow>
                  ))
                ) : <TableRow><TableCell colSpan={3} className="h-24 text-center">Nenhum relatório encontrado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderReportsPage;