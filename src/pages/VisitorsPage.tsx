import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Visitor } from "@/types";
import { VisitorFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import VisitorForm from "@/components/visitors/VisitorForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fetchVisitors = async (): Promise<Visitor[]> => {
  const { data, error } = await supabase.from("visitors").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const followUpStatuses: Visitor['follow_up_status'][] = ['Novo', 'Em acompanhamento', 'Decidiu por Cristo', 'Aguardando Batismo', 'Integrado como Membro'];

const VisitorsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const { data: visitors, isLoading } = useQuery<Visitor[]>({ queryKey: ["visitors"], queryFn: fetchVisitors });

  const addOrEditMutation = useMutation({
    mutationFn: async (formData: { data: VisitorFormValues; id?: string }) => {
      const { data, id } = formData;
      const { error } = id
        ? await supabase.from("visitors").update(data).eq("id", id)
        : await supabase.from("visitors").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      showSuccess(`Visitante ${selectedVisitor ? 'atualizado' : 'adicionado'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedVisitor(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("visitors").update({ follow_up_status: status }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      showSuccess("Status do visitante atualizado!");
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const columns: ColumnDef<Visitor>[] = [
    { accessorKey: "full_name", header: "Nome" },
    { accessorKey: "phone", header: "Telefone" },
    { accessorKey: "visit_status", header: "Visita" },
    {
      accessorKey: "follow_up_status",
      header: "Status do Acompanhamento",
      cell: ({ row }) => (
        <Select
          value={row.original.follow_up_status}
          onValueChange={(status) => updateStatusMutation.mutate({ id: row.original.id, status })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Alterar status" />
          </SelectTrigger>
          <SelectContent>
            {followUpStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => { setSelectedVisitor(row.original); setIsDialogOpen(true); }}>Editar Dados</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleSubmit = (data: VisitorFormValues) => {
    addOrEditMutation.mutate({ data, id: selectedVisitor?.id });
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
          <h1 className="text-3xl font-bold">Recepção de Visitantes</h1>
          <p className="mt-2 text-muted-foreground">Cadastre e acompanhe os visitantes da sua igreja.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedVisitor(null); }}>
          <DialogTrigger asChild><Button>Adicionar Visitante</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader><DialogTitle>{selectedVisitor ? "Editar Visitante" : "Cadastrar Novo Visitante"}</DialogTitle></DialogHeader>
            <VisitorForm onSubmit={handleSubmit} defaultValues={selectedVisitor || undefined} isSubmitting={addOrEditMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>{columns.map(col => <TableHead key={col.id}>{col.header as string}</TableHead>)}</TableHeader>
            <TableBody>
              {visitors && visitors.length > 0 ? (
                visitors.map(visitor => (
                  <TableRow key={visitor.id}>
                    {columns.map(col => (
                      <TableCell key={col.id}>
                        {col.cell ? (col.cell as any)({ row: { original: visitor } }) : (visitor as any)[col.accessorKey as string]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhum visitante encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorsPage;