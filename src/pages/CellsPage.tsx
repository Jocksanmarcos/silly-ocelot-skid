import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Cell } from "@/types";
import { CellFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Users } from "lucide-react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import CellForm from "@/components/cells/CellForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const fetchCells = async (): Promise<Cell[]> => {
  const { data, error } = await supabase.from("cells").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

interface DataTableProps {
  columns: ColumnDef<Cell>[];
  data: Cell[];
}

function CellsDataTable({ columns, data }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhuma célula encontrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
      </div>
    </div>
  );
}

const CellsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  const { data: cells, isLoading } = useQuery<Cell[]>({ queryKey: ["cells"], queryFn: fetchCells });

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

  const columns: ColumnDef<Cell>[] = [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "leader_name", header: "Líder" },
    { accessorKey: "meeting_day", header: "Dia" },
    { accessorKey: "meeting_time", header: "Hora" },
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
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">Remover</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleSubmit = (data: CellFormValues) => {
    mutation.mutate({ cell: data, id: selectedCell?.id });
  };

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
          <h1 className="text-3xl font-bold">Gestão de Células</h1>
          <p className="mt-2 text-muted-foreground">Crie e gerencie os pequenos grupos da sua igreja.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedCell(null); }}>
          <DialogTrigger asChild><Button>Adicionar Célula</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader><DialogTitle>{selectedCell ? "Editar Célula" : "Adicionar Nova Célula"}</DialogTitle></DialogHeader>
            <CellForm onSubmit={handleSubmit} defaultValues={selectedCell || undefined} isSubmitting={mutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <CellsDataTable columns={columns} data={cells || []} />

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