import { useLeaderCell } from "@/hooks/useLeaderCell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CellMember, CellReport } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Home, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const fetchCellMembers = async (cellId: string) => {
  const { data, error } = await supabase.from('cell_members').select('*').eq('cell_id', cellId).order('created_at', { ascending: false }).limit(5);
  if (error) throw new Error(error.message);
  return data;
};

const fetchCellReports = async (cellId: string) => {
  const { data, error } = await supabase.from('cell_reports').select('*').eq('cell_id', cellId).order('meeting_date', { ascending: false }).limit(5);
  if (error) throw new Error(error.message);
  return data;
};

const LeaderDashboardPage = () => {
  const { cell, isLoading: isLoadingCell, isLeader } = useLeaderCell();

  const { data: members, isLoading: isLoadingMembers } = useQuery<CellMember[]>({
    queryKey: ['cellMembersDashboard', cell?.id],
    queryFn: () => fetchCellMembers(cell!.id),
    enabled: !!cell,
  });

  const { data: reports, isLoading: isLoadingReports } = useQuery<CellReport[]>({
    queryKey: ['cellReportsDashboard', cell?.id],
    queryFn: () => fetchCellReports(cell!.id),
    enabled: !!cell,
  });

  if (isLoadingCell) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!isLeader || !cell) {
    return (
      <Alert>
        <Home className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Você não foi designado como líder de nenhuma célula. Se isso for um erro, entre em contato com a administração.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Minha Célula: {cell.name}</h1>
        <p className="text-muted-foreground">{cell.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Últimos Interessados</CardTitle>
            <CardDescription>As 5 pessoas mais recentes que demonstraram interesse.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoadingMembers ? <Skeleton className="h-40 w-full" /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {members && members.length > 0 ? members.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>{m.full_name}</TableCell>
                      <TableCell><span className={`px-2 py-1 text-xs rounded-full ${m.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{m.status === 'approved' ? 'Aprovado' : 'Pendente'}</span></TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={2} className="text-center">Nenhum membro encontrado.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full"><Link to="/leader/members">Gerenciar Todos os Membros</Link></Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> Últimos Relatórios</CardTitle>
            <CardDescription>Os 5 relatórios de encontro mais recentes.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoadingReports ? <Skeleton className="h-40 w-full" /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Presentes</TableHead></TableRow></TableHeader>
                <TableBody>
                  {reports && reports.length > 0 ? reports.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.meeting_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell>{r.attendance_count}</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={2} className="text-center">Nenhum relatório enviado.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full"><Link to="/leader/reports">Ver e Adicionar Relatórios</Link></Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LeaderDashboardPage;