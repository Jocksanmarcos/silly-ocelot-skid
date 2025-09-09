import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cell, CellReport } from '@/types';
import { CellReportFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import CellReportForm from '@/components/cells/CellReportForm';

const fetchCellDetailsAndReports = async (cellId: string) => {
  const cellPromise = supabase.from('cells').select('name').eq('id', cellId).single();
  const reportsPromise = supabase.from('cell_reports').select('*').eq('cell_id', cellId).order('meeting_date', { ascending: false });

  const [{ data: cell, error: cellError }, { data: reports, error: reportsError }] = await Promise.all([cellPromise, reportsPromise]);

  if (cellError) throw new Error(`Erro ao buscar detalhes da célula: ${cellError.message}`);
  if (reportsError) throw new Error(`Erro ao buscar relatórios: ${reportsError.message}`);
  
  return { cell, reports: reports as CellReport[] };
};

const CellReportsPage = () => {
  const { id: cellId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cell_reports', cellId],
    queryFn: () => fetchCellDetailsAndReports(cellId!),
    enabled: !!cellId,
  });

  const addReportMutation = useMutation({
    mutationFn: async (formData: CellReportFormValues) => {
      const { error } = await supabase.from('cell_reports').insert({
        cell_id: cellId,
        ...formData,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cell_reports', cellId] });
      showSuccess('Relatório adicionado com sucesso!');
      setIsDialogOpen(false);
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

  const { cell, reports } = data || { cell: null, reports: [] };

  return (
    <div>
      <Link to="/dashboard/cells" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Células
      </Link>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios da Célula: {cell?.name}</h1>
          <p className="mt-2 text-muted-foreground">
            Visualize e adicione os relatórios de encontros.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Relatório
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Relatório de Encontro</DialogTitle>
            </DialogHeader>
            <CellReportForm 
              onSubmit={(data) => addReportMutation.mutate(data)}
              isSubmitting={addReportMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Encontros</CardTitle>
          <CardDescription>{reports?.length || 0} relatório(s) encontrado(s).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data do Encontro</TableHead>
                <TableHead>Presentes</TableHead>
                <TableHead>Anotações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports && reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{new Date(report.meeting_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell>{report.attendance_count}</TableCell>
                    <TableCell className="max-w-sm truncate">{report.notes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhum relatório encontrado para esta célula.
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

export default CellReportsPage;