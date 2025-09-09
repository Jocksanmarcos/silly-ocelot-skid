import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Family, Member } from "@/types";
import { FamilyFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Users } from "lucide-react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import FamilyForm from "@/components/families/FamilyForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const fetchFamilies = async (): Promise<Family[]> => {
  const { data, error } = await supabase.from("families").select("*, members(first_name, last_name)").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase.from("members").select("id, first_name, last_name").order("first_name");
  if (error) throw new Error(error.message);
  return data;
};

const FamiliesPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);

  const { data: families, isLoading: isLoadingFamilies } = useQuery<Family[]>({ queryKey: ["families"], queryFn: fetchFamilies });
  const { data: members, isLoading: isLoadingMembers } = useQuery<Member[]>({ queryKey: ["membersForFamilies"], queryFn: fetchMembers });

  const mutation = useMutation({
    mutationFn: async (formData: { data: FamilyFormValues; id?: string }) => {
      const { data, id } = formData;
      const { error } = id
        ? await supabase.from("families").update(data).eq("id", id)
        : await supabase.from("families").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      showSuccess(`Família ${selectedFamily ? 'atualizada' : 'criada'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedFamily(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("families").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      showSuccess("Família removida com sucesso!");
      setIsAlertOpen(false);
      setSelectedFamily(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const handleEdit = (family: Family) => {
    setSelectedFamily(family);
    setIsDialogOpen(true);
  };

  const handleDelete = (family: Family) => {
    setSelectedFamily(family);
    setIsAlertOpen(true);
  };

  const columns: ColumnDef<Family>[] = [
    { accessorKey: "name", header: "Nome da Família" },
    {
      header: "Responsável",
      cell: ({ row }) => row.original.members ? `${row.original.members.first_name} ${row.original.members.last_name}` : 'Não definido',
    },
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
    data: families || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSubmit = (data: FamilyFormValues) => {
    mutation.mutate({ data, id: selectedFamily?.id });
  };

  if (isLoadingFamilies || isLoadingMembers) {
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
          <h1 className="text-3xl font-bold">Gestão de Famílias</h1>
          <p className="mt-2 text-muted-foreground">Crie e gerencie os núcleos familiares da sua comunidade.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link to="/dashboard/families/tree">
                    <Users className="mr-2 h-4 w-4" />
                    Visão Genealógica
                </Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedFamily(null); }}>
            <DialogTrigger asChild><Button>Criar Família</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>{selectedFamily ? "Editar Família" : "Criar Nova Família"}</DialogTitle></DialogHeader>
                <FamilyForm onSubmit={handleSubmit} defaultValues={selectedFamily || undefined} isSubmitting={mutation.isPending} members={members || []} />
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
            )) : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhuma família encontrada.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso removerá permanentemente a família.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFamily(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedFamily && deleteMutation.mutate(selectedFamily.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Removendo..." : "Remover"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FamiliesPage;