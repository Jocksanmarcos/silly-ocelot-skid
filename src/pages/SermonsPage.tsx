import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sermon, Profile } from "@/types";
import { SermonFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import SermonForm from "@/components/sermoes/SermonForm";
import { Skeleton } from "@/components/ui/skeleton";

const fetchSermonsData = async () => {
  const sermonsPromise = supabase.from("sermons").select("*, profiles(full_name)").order("sermon_date", { ascending: false });
  const preachersPromise = supabase.from("profiles").select("id, full_name").or("role.eq.pastor,role.eq.super_admin,role.eq.admin_missao").order("full_name");
  
  const [{ data: sermons, error: sermonsError }, { data: preachers, error: preachersError }] = await Promise.all([sermonsPromise, preachersPromise]);

  if (sermonsError || preachersError) throw new Error(sermonsError?.message || preachersError?.message);
  return { sermons, preachers };
};

const SermonsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sermonsData"],
    queryFn: fetchSermonsData,
  });

  const mutation = useMutation({
    mutationFn: async (formData: { data: SermonFormValues; id?: string }) => {
      const { data, id } = formData;
      const { error } = id
        ? await supabase.from("sermons").update(data).eq("id", id)
        : await supabase.from("sermons").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermonsData"] });
      showSuccess(`Sermão ${selectedSermon ? 'atualizado' : 'adicionado'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedSermon(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const handleEdit = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: SermonFormValues) => {
    mutation.mutate({ data, id: selectedSermon?.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Sermões</h1>
          <p className="mt-2 text-muted-foreground">Adicione e gerencie as pregações da sua igreja.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedSermon(null); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Sermão</Button></DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>{selectedSermon ? "Editar Sermão" : "Adicionar Novo Sermão"}</DialogTitle></DialogHeader>
            <SermonForm onSubmit={handleSubmit} defaultValues={selectedSermon || undefined} isSubmitting={mutation.isPending} preachers={data?.preachers || []} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Pregador(a)</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-24 w-full" /></TableCell></TableRow> :
             data?.sermons?.map(sermon => (
              <TableRow key={sermon.id}>
                <TableCell className="font-medium">{sermon.title}</TableCell>
                <TableCell>{(sermon.profiles as any)?.full_name || 'N/A'}</TableCell>
                <TableCell>{new Date(sermon.sermon_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(sermon)}>Editar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
             ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SermonsPage;