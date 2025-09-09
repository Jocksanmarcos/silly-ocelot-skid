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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

const volunteerStatuses: Volunteer['status'][] = ['pending', 'approved', 'inactive'];

const VoluntariadoAdminPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);

  const { data: ministries, isLoading: isLoadingMinistries } = useQuery({ queryKey: ["ministries"], queryFn: fetchMinistries });
  const { data: volunteers, isLoading: isLoadingVolunteers } = useQuery({ queryKey: ["volunteers"], queryFn: fetchVolunteers });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery({ queryKey: ["profilesForMinistries"], queryFn: fetchProfiles });

  const ministryMutation = useMutation({
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

  const statusMutation = useMutation({
    mutationFn: async ({ volunteerId, status }: { volunteerId: string, status: Volunteer['status'] }) => {
        const { error } = await supabase.from("volunteers").update({ status }).eq("id", volunteerId);
        if (error) throw new Error(error.message);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["volunteers"] });
        showSuccess("Status do voluntário atualizado.");
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleEdit = (ministry: Ministry) => {
    setSelectedMinistry(ministry);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: MinistryFormValues) => {
    ministryMutation.mutate({ data, id: selectedMinistry?.id });
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
              <MinistryForm onSubmit={handleSubmit} defaultValues={selectedMinistry || undefined} isSubmitting={ministryMutation.isPending} profiles={profiles || []} />
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
              <Table>
                <TableHeader><TableRow><TableHead>Voluntário</TableHead><TableHead>Ministério</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-24 w-full" /></TableCell></TableRow> :
                   volunteers?.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.profiles?.full_name}</TableCell>
                      <TableCell>{v.ministries?.name}</TableCell>
                      <TableCell>{new Date(v.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Select value={v.status} onValueChange={(status) => statusMutation.mutate({ volunteerId: v.id, status: status as Volunteer['status'] })}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {volunteerStatuses.map(s => <SelectItem key={s} value={s}>{s === 'pending' ? 'Pendente' : s === 'approved' ? 'Aprovado' : 'Inativo'}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                   ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoluntariadoAdminPage;