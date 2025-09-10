import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contribution, Member, Congregation, Profile } from "@/types";
import { ContributionFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, BarChart } from "lucide-react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import ContributionForm from "@/components/finances/ContributionForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";

const fetchContributions = async (): Promise<Contribution[]> => {
  const { data, error } = await supabase.from("contributions").select("*, members(first_name, last_name)").order("contribution_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase.from("members").select("id, first_name, last_name").order("first_name");
  if (error) throw new Error(error.message);
  return data;
};

const fetchCongregations = async (): Promise<Congregation[]> => {
    const { data, error } = await supabase.from("congregations").select("id, name").order("name");
    if (error) throw new Error(error.message);
    return data;
};

const FinancesPage = () => {
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  const { data: contributions, isLoading: isLoadingContributions } = useQuery<Contribution[]>({ queryKey: ["contributions"], queryFn: fetchContributions });
  const { data: members, isLoading: isLoadingMembers } = useQuery<Member[]>({ queryKey: ["membersForFinances"], queryFn: fetchMembers });
  const { data: congregations, isLoading: isLoadingCongregations } = useQuery<Congregation[]>({ queryKey: ["congregations"], queryFn: fetchCongregations });

  const mutation = useMutation({
    mutationFn: async (formData: { data: ContributionFormValues; id?: string }) => {
      const { data, id } = formData;
      const submissionData = {
        member_id: data.member_id || null,
        contributor_name: data.contributor_name || null,
        amount: data.amount,
        contribution_date: data.contribution_date,
        fund: data.fund,
        payment_method: data.payment_method,
        notes: data.notes,
        congregation_id: data.congregation_id,
      };
      const { error } = id
        ? await supabase.from("contributions").update(submissionData).eq("id", id)
        : await supabase.from("contributions").insert(submissionData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      showSuccess(`Contribuição ${selectedContribution ? 'atualizada' : 'adicionada'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedContribution(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contributions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      showSuccess("Contribuição removida com sucesso!");
      setIsAlertOpen(false);
      setSelectedContribution(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const handleEdit = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setIsDialogOpen(true);
  };

  const handleDelete = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setIsAlertOpen(true);
  };

  const columns: ColumnDef<Contribution>[] = [
    {
      header: "Contribuinte",
      cell: ({ row }) => row.original.members ? `${row.original.members.first_name} ${row.original.members.last_name}` : row.original.contributor_name,
    },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => `R$ ${row.original.amount.toFixed(2).replace('.', ',')}` },
    { accessorKey: "contribution_date", header: "Data", cell: ({ row }) => new Date(row.original.contribution_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) },
    { accessorKey: "fund", header: "Fundo" },
    { accessorKey: "payment_method", header: "Método" },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">Remover</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: contributions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSubmit = (data: ContributionFormValues) => {
    mutation.mutate({ data, id: selectedContribution?.id });
  };

  const isLoading = isLoadingContributions || isLoadingMembers || isLoadingProfile || isLoadingCongregations;
  const isSuperAdmin = userProfile?.role === 'super_admin';

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-32" /></div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <p className="mt-2 text-muted-foreground">Registre dízimos, ofertas e outras contribuições.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link to="/dashboard/finances/dashboard">
                    <BarChart className="mr-2 h-4 w-4" />
                    Painel Financeiro
                </Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedContribution(null); }}>
            <DialogTrigger asChild><Button>Adicionar Contribuição</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader><DialogTitle>{selectedContribution ? "Editar Contribuição" : "Adicionar Nova Contribuição"}</DialogTitle></DialogHeader>
                <ContributionForm 
                    onSubmit={handleSubmit} 
                    defaultValues={selectedContribution || undefined} 
                    isSubmitting={mutation.isPending} 
                    members={members || []}
                    congregations={congregations || []}
                    isSuperAdmin={isSuperAdmin}
                    userCongregationId={userProfile?.congregation_id}
                />
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>{table.getHeaderGroups().map(hg => <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
            )) : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhuma contribuição encontrada.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso removerá permanentemente o registro da contribuição.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedContribution(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedContribution && deleteMutation.mutate(selectedContribution.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Removendo..." : "Remover"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FinancesPage;