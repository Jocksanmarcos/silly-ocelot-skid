import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ministry, Profile, Volunteer } from "@/types";
import { MinistryFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import MinistryForm from "@/components/voluntariado/MinistryForm";
import { PlusCircle } from "lucide-react";

const fetchMinistries = async (): Promise<Ministry[]> => {
  const { data, error } = await supabase.from("ministries").select("*, profiles(full_name)").order("name");
  if (error) throw new Error(error.message);
  return data;
};

const fetchVolunteers = async (): Promise<Volunteer[]> => {
    const { data, error } = await supabase.from("volunteers").select("*, profiles(full_name), ministries(name)").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name");
  if (error) throw new Error(error.message);
  return data;
};

const VoluntariadoAdminPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);

  const { data: ministries, isLoading: isLoadingMinistries } = useQuery({ queryKey: ["ministries"], queryFn: fetchMinistries });
  const { data: volunteers, isLoading: isLoadingVolunteers } = useQuery({ queryKey: ["volunteers"], queryFn: fetchVolunteers });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery({ queryKey: ["profilesForMinistries"], queryFn: fetchProfiles });

  const mutation = useMutation({
    mutationFn: async (formData: { data: MinistryFormValues; id?: string }) => {
      const { data, id } = formData;
      const { error } = id
        ? await supabase.from("ministries").update(data).eq("id", id)
        : await supabase.from("ministries").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      showSuccess(`Ministério ${selectedMinistry ? 'atualizado' : 'criado'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedMinistry(null);
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleEdit = (ministry: Ministry) => {
    setSelectedMinistry(ministry);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: MinistryFormValues) => {
    mutation.mutate({ data, id: selectedMinistry?.id });
  };

  const isLoading = isLoadingMinistries || isLoadingVolunteers || isLoadingProfiles;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Voluntariado</h1>
        <p className="mt-2 text-muted-foreground">Gerencie os ministérios e as pessoas que servem na sua comunidade.</p>
      </div>

      <Tabs defaultValue="ministerios">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="ministerios">Ministérios</TabsTrigger>
            <TabsTrigger value="voluntarios">Inscrições</TabsTrigger>
          </TabsList>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedMinistry(null); }}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ministério</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{selectedMinistry ? "Editar Ministério" : "Novo Ministério"}</DialogTitle></DialogHeader>
              <MinistryForm onSubmit={handleSubmit} defaultValues={selectedMinistry || undefined} isSubmitting={mutation.isPending} profiles={profiles || []} />
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="ministerios">
          <Card>
            <CardHeader><CardTitle>Ministérios Cadastrados</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Líder/Contato</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? <TableRow><TableCell colSpan={3}><Skeleton className="h-24 w-full" /></TableCell></TableRow> :
                   ministries?.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.profiles?.full_name || 'Não definido'}</TableCell>
                      <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleEdit(m)}>Editar</Button></TableCell>
                    </TableRow>
                   ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="voluntarios">
          <Card>
            <CardHeader><CardTitle>Inscrições de Voluntários</CardTitle><CardDescription>Aprove ou gerencie os voluntários inscritos.</CardDescription></CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-8">A gestão de inscrições será implementada aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoluntariadoAdminPage;