import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loan } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const fetchLoans = async (): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from("loans")
    .select("*, books(title), profiles(full_name)")
    .order("loan_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const LoansList = () => {
  const queryClient = useQueryClient();
  const { data: loans, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: fetchLoans,
  });

  const returnMutation = useMutation({
    mutationFn: async (loanId: string) => {
      const { error } = await supabase
        .from("loans")
        .update({ return_date: new Date().toISOString() })
        .eq("id", loanId);
      if (error) throw new Error(error.message);
      
      // Also update the book status back to 'disponivel'
      const loan = loans?.find(l => l.id === loanId);
      if (loan) {
        const { error: bookError } = await supabase
          .from("books")
          .update({ status: 'disponivel' })
          .eq('id', loan.book_id);
        if (bookError) throw new Error(`Erro ao atualizar status do livro: ${bookError.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["books"] }); // To update available books list
      showSuccess("Devolução registrada com sucesso!");
    },
    onError: (error: Error) => showError(error.message),
  });

  const formatDate = (dateString: string) => format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Livro</TableHead>
            <TableHead>Membro</TableHead>
            <TableHead>Data do Empréstimo</TableHead>
            <TableHead>Data de Devolução</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans && loans.length > 0 ? (
            loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.books?.title || 'Livro não encontrado'}</TableCell>
                <TableCell>{loan.profiles?.full_name || 'Membro não encontrado'}</TableCell>
                <TableCell>{formatDate(loan.loan_date)}</TableCell>
                <TableCell>{formatDate(loan.due_date)}</TableCell>
                <TableCell>
                  {loan.return_date ? (
                    <Badge variant="secondary">Devolvido em {formatDate(loan.return_date)}</Badge>
                  ) : new Date(loan.due_date) < new Date() ? (
                    <Badge variant="destructive">Atrasado</Badge>
                  ) : (
                    <Badge variant="outline">Emprestado</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!loan.return_date && (
                    <Button
                      size="sm"
                      onClick={() => returnMutation.mutate(loan.id)}
                      disabled={returnMutation.isPending}
                    >
                      Registrar Devolução
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum empréstimo registrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LoansList;