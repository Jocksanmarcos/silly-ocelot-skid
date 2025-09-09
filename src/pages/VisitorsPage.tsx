import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Visitor, Member, Family } from "@/types";
import { MemberFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, CheckSquare, Users } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import VisitorForm from "@/components/visitors/VisitorForm";
import MemberForm from "@/components/members/MemberForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetchVisitors = async (): Promise<Visitor[]> => {
  const { data, error } = await supabase.from("visitors").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchFamilies = async (): Promise<Family[]> => {
  const { data, error } = await supabase.from("families").select("id, name").order("name");
  if (error) throw new Error(error.message);
  return data;
};

const followUpStatuses: Visitor['follow_up_status'][] = ['Novo', 'Em acompanhamento', 'Decidiu por Cristo', 'Aguardando Batismo', 'Integrado como Membro'];

const VisitorsPage = () => {
  const queryClient = useQueryClient();
  const [isVisitorDialogOpen, setIsVisitorDialogOpen] = useState(false);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const { data: visitors, isLoading: isLoadingVisitors } = useQuery<Visitor[]>({ queryKey: ["visitors"], queryFn: fetchVisitors });
  const { data: families, isLoading: isLoadingFamilies } = useQuery<Family[]>({ queryKey: ["familiesForMembers"], queryFn: fetchFamilies });

  const visitorStats = useMemo(() => {
    if (!visitors) return { active: 0, decisions: 0, integrated: 0 };
    return {
      active: visitors.filter(v => v.follow_up_status === 'Novo' || v.follow_up_status === 'Em acompanhamento').length,
      decisions: visitors.filter(v => v.follow_up_status === 'Decidiu por Cristo' || v.follow_up_status === 'Aguardando Batismo').length,
      integrated: visitors.filter(v => v.follow_up_status === 'Integrado como Membro').length,
    };
  }, [visitors]);

  const addOrEditVisitorMutation = useMutation({
    mutationFn: async (formData: { data: any; id?: string }) => {
      const { data, id } = formData;
      const { error } = id ? await supabase.from("visitors").update(data).eq("id", id) : await supabase.from("visitors").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      showSuccess(`Visitante ${selectedVisitor ? 'atualizado' : 'adicionado'} com sucesso!`);
      setIsVisitorDialogOpen(false);
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

  const integrateVisitorMutation = useMutation({
    mutationFn: async (memberData: MemberFormValues) => {
      // 1. Create new member
      const { error: memberError } = await supabase.from("members").insert(memberData);
      if (memberError) throw new Error(`Erro ao criar membro: ${memberError.message}`);

      // 2. Update visitor status
      const { error: visitorError } = await supabase.from("visitors").update({ follow_up_status: 'Integrado como Membro' }).eq("id", selectedVisitor!.id);
      if (visitorError) throw new Error(`Erro ao atualizar visitante: ${visitorError.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      showSuccess("Visitante integrado como membro com sucesso!");
      setIsIntegrationDialogOpen(false);
      setSelectedVisitor(null);
    },
    onError: (error) => { showError(error.message); },
  });

  const handleOpenIntegration = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsIntegrationDialogOpen(true);
  };

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
          disabled={row.original.follow_up_status === 'Integrado como Membro'}
        >
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Alterar status" /></SelectTrigger>
          <SelectContent>{followUpStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
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
            <DropdownMenuItem onClick={() => { setSelectedVisitor(row.original); setIsVisitorDialogOpen(true); }}>Editar Dados</DropdownMenuItem>
            {row.original.follow_up_status !== 'Integrado como Membro' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenIntegration(row.original)}><UserPlus className="mr-2 h-4 w-4" /> Integrar como Membro</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const isLoading = isLoadingVisitors || isLoadingFamilies;

  const getIntegrationDefaultValues = () => {
    if (!selectedVisitor) return {};
    const nameParts = selectedVisitor.full_name.split(' ');
    return {
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      email: selectedVisitor.email || '',
      phone: selectedVisitor.phone || '',
      membership_date: new Date().toISOString().split('T')[0],
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Recepção de Visitantes</h1>
          <p className="mt-2 text-muted-foreground">Cadastre e acompanhe os visitantes da sua igreja.</p>
        </div>
        <Dialog open={isVisitorDialogOpen} onOpenChange={(open) => { setIsVisitorDialogOpen(open); if (!open) setSelectedVisitor(null); }}>
          <DialogTrigger asChild><Button>Adicionar Visitante</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader><DialogTitle>{selectedVisitor ? "Editar Visitante" : "Cadastrar Novo Visitante"}</DialogTitle></DialogHeader>
            <VisitorForm onSubmit={(data) => addOrEditVisitorMutation.mutate({ data, id: selectedVisitor?.id })} defaultValues={selectedVisitor || undefined} isSubmitting={addOrEditVisitorMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Acompanhamento Ativo</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-1/2" /> : visitorStats.active}</div><p className="text-xs text-muted-foreground">Visitantes em fase inicial de contato.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Novas Decisões</CardTitle><CheckSquare className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-1/2" /> : visitorStats.decisions}</div><p className="text-xs text-muted-foreground">Aguardando discipulado e batismo.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Membros Integrados</CardTitle><UserPlus className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-1/2" /> : visitorStats.integrated}</div><p className="text-xs text-muted-foreground">Visitantes que se tornaram membros.</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>{columns.map((column, i) => <TableHead key={i}>{(column as any).header}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ) : visitors && visitors.length > 0 ? (
                visitors.map(visitor => (
                  <TableRow key={visitor.id}>
                    {columns.map((column, i) => <TableCell key={i}>{(column as any).cell ? (column as any).cell({ row: { original: visitor } }) : (visitor as any)[(column as any).accessorKey]}</TableCell>)}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhum visitante encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isIntegrationDialogOpen} onOpenChange={(open) => { setIsIntegrationDialogOpen(open); if (!open) setSelectedVisitor(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Integrar {selectedVisitor?.full_name} como Membro</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Complete os dados abaixo para finalizar a integração. As informações do visitante já foram preenchidas.</p>
          <MemberForm 
            onSubmit={(data) => integrateVisitorMutation.mutate(data)}
            defaultValues={getIntegrationDefaultValues() as Member}
            isSubmitting={integrateVisitorMutation.isPending}
            families={families || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitorsPage;