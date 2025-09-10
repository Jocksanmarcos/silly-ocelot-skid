import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Cell, Profile } from "@/types";
import { CellFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Users, FileText } from "lucide-react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import CellForm from "@/components/cells/CellForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const fetchCells = async (): Promise<Cell[]> => {
  const { data, error } = await supabase
    .from("cells")
    .select("*, leader:profiles!leader_id(full_name), supervisor:profiles!supervisor_id(full_name)")
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  
  return data.map(cell => ({
    ...cell,
    leader_name: (cell.leader as any)?.full_name,
    supervisor_name: (cell.supervisor as any)?.full_name,
  })) as any;
};

const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");
  if (error) throw new Error(error.message);
  return data as Profile[];
};

const CellsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  const { data: cells, isLoading: isLoadingCells } = useQuery<Cell[]>({ queryKey: ["cells"], queryFn: fetchCells });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({ queryKey: ["profiles"], queryFn: fetchProfiles });

  const mutation = useMutation({
    mutationFn: async (formData: { cell: CellFormValues; id?: string }) => {
      const { cell, id } = formData;
      const { error } = id
        ? await supabase.from("cells").update(cell).eq("id", id)
        : await supabase.from("cells").insert(cell);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      showSuccess(`Célula ${selectedCell ? 'atualizada' : 'criada'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedCell(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cells").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      showSuccess("Célula removida com sucesso!");
      setIsAlertOpen(false);
      setSelectedCell(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const handleEdit = (cell: Cell) => {
    setSelectedCell(cell);
    setIsDialogOpen(true);
  };

  const handleDelete = (cell: Cell) => {
    setSelectedCell(cell);
    setIsAlertOpen(true);
  };

  const columns: ColumnDef<Cell & { supervisor_name?: string }>[] = [
    { accessorKey: "name", header: "Nome" },
    { 
      accessorKey: "leader_name",
      header: "Líder",
      cell: ({ row }) => (row.original as any).leader_name || 'Não definido',
    },
    { 
      accessorKey: "supervisor_name",
      header: "Supervisor",
      cell: ({ row }) => (row.original as any).supervisor_name || 'Não definido',
    },
    { accessorKey: "meeting_day", header: "Dia" },
    { accessorKey: "status", header: "Status" },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/cells/${row.original.id}/members`} className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Ver Membros
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/cells/${row.original.id}/reports`} className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Ver Relatórios
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">Remover</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: cells || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSubmit = (data: CellFormValues) => {
    mutation.mutate({ cell: data, id: selectedCell?.id });
  };

  if (isLoadingCells || isLoadingProfiles) {
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
          <h1 className="text-3xl font-bold">Gestão de Células</h1>
          <p className="mt-2 text-muted-foreground">Crie e gerencie os pequenos grupos da sua igreja.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedCell(null); }}>
          <DialogTrigger asChild><Button>Adicionar Célula</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader><DialogTitle>{selectedCell ? "Editar Célula" : "Adicionar Nova Célula"}</DialogTitle></DialogHeader>
            <CellForm onSubmit={handleSubmit} defaultValues={selectedCell || undefined} isSubmitting={mutation.isPending} profiles={profiles || []} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>{table.getHeaderGroups().map(hg => <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
            )) : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhuma célula encontrada.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. Isso removerá permanentemente a célula.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCell(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedCell && deleteMutation.mutate(selectedCell.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CellsPage;