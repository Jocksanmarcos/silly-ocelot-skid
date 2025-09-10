import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  details: any;
}

const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) throw new Error(error.message);
  return data;
};

const AuditLogPage = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: fetchAuditLogs,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Logs de Auditoria</h3>
        <p className="text-sm text-muted-foreground">
          Registro de todas as ações importantes realizadas na plataforma.
        </p>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data e Hora</TableHead>
              <TableHead>Usuário (ID)</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ) : logs && logs.length > 0 ? (
              logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.created_at).toLocaleString('pt-BR')}</TableCell>
                  <TableCell><Badge variant="outline">{log.user_id.substring(0, 8)}...</Badge></TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell><pre className="text-xs bg-muted p-2 rounded-md">{JSON.stringify(log.details, null, 2)}</pre></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum registro de auditoria encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuditLogPage;