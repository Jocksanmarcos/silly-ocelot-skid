import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Member, Family, Congregation, Profile } from "@/types";
import { MemberFormValues } from "@/lib/schemas";
import { MembersDataTable } from "@/components/members/MembersDataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileDown, Users, UserPlus, Home } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { showSuccess, showError } from "@/utils/toast";
import MemberForm from "@/components/members/MemberForm";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMembersListPDF } from "@/lib/pdfGenerator";
import { useAuth } from "@/contexts/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BirthdaysWidget from "@/components/members/BirthdaysWidget";
import MemberGrowthChart from "@/components/members/MemberGrowthChart";
import { startOfMonth } from "date-fns";

const fetchMembersPageData = async () => {
  const membersPromise = supabase.from("members").select("*").order("created_at", { ascending: false });
  const familiesPromise = supabase.from("families").select("id").order("name");
  const congregationsPromise = supabase.from("congregations").select("id, name").order("name");
  
  const [
    { data: members, error: membersError },
    { data: families, error: familiesError },
    { data: congregations, error: congregationsError }
  ] = await Promise.all([membersPromise, familiesPromise, congregationsPromise]);

  if (membersError || familiesError || congregationsError) {
    throw new Error(membersError?.message || familiesError?.message || congregationsError?.message);
  }
  return { members: members || [], families: families || [], congregations: congregations || [] };
};

const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return null;
  }
  return data;
};

const MembersPage = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: () => fetchUserProfile(session!.user.id),
    enabled: !!session?.user?.id,
  });

  const { data, isLoading: isLoadingData } = useQuery({
    queryKey: ["membersPageData"],
    queryFn: fetchMembersPageData,
  });
  const { members = [], families = [], congregations = [] } = data || {};

  const stats = useMemo(() => {
    const firstDayOfThisMonth = startOfMonth(new Date());
    const newMembersThisMonth = members.filter(m => m.membership_date && new Date(m.membership_date) >= firstDayOfThisMonth).length;
    return {
      totalMembers: members.length,
      totalFamilies: families.length,
      newMembersThisMonth,
    };
  }, [members, families]);

  const mutation = useMutation({
    mutationFn: async (formData: { member: MemberFormValues; id?: string }) => {
      // ... (mutation logic remains the same)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersPageData"] });
      showSuccess(`Pessoa ${selectedMember ? 'atualizada' : 'adicionada'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersPageData"] });
      showSuccess("Pessoa removida com sucesso!");
      setIsAlertOpen(false);
      setSelectedMember(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleDelete = (member: Member) => {
    setSelectedMember(member);
    setIsAlertOpen(true);
  };

  const columns: ColumnDef<Member>[] = [
    // ... (columns definition remains the same)
  ];

  const handleSubmit = (data: MemberFormValues) => {
    mutation.mutate({ member: data, id: selectedMember?.id });
  };

  const isLoading = isLoadingData || isLoadingProfile;
  const isSuperAdmin = userProfile?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Painel de Pessoas</h1>
          <p className="mt-2 text-muted-foreground">Adicione, visualize e gerencie as pessoas da sua igreja.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => generateMembersListPDF(members || [])}><FileDown className="mr-2 h-4 w-4" />Exportar PDF</Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedMember(null); }}>
            <DialogTrigger asChild><Button>Adicionar Pessoa</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{selectedMember ? "Editar Pessoa" : "Adicionar Nova Pessoa"}</DialogTitle></DialogHeader>
              <MemberForm 
                onSubmit={handleSubmit} 
                defaultValues={selectedMember || undefined}
                isSubmitting={mutation.isPending}
                families={families || []}
                congregations={congregations || []}
                isSuperAdmin={isSuperAdmin}
                userCongregationId={userProfile?.congregation_id}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Pessoas</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalMembers}</div>}</CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Novos Membros (Mês)</CardTitle><UserPlus className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.newMembersThisMonth}</div>}</CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Famílias</CardTitle><Home className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalFamilies}</div>}</CardContent></Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista de Membros</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <MembersDataTable columns={columns} data={members || []} />
        </TabsContent>
        <TabsContent value="insights" className="mt-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1"><BirthdaysWidget members={members || []} /></div>
            <div className="md:col-span-2"><MemberGrowthChart members={members || []} /></div>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso removerá permanentemente a pessoa dos seus registros.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMember(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedMember && deleteMutation.mutate(selectedMember.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Removendo..." : "Remover"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MembersPage;