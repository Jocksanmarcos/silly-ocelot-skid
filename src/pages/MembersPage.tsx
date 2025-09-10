import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Member, Family, Congregation, Profile } from "@/types";
import { MemberFormValues } from "@/lib/schemas";
import { MembersDataTable } from "@/components/members/MembersDataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, BarChart, FileDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { showSuccess, showError } from "@/utils/toast";
import MemberForm from "@/components/members/MemberForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { generateMembersListPDF } from "@/lib/pdfGenerator";
import { useAuth } from "@/contexts/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchFamilies = async (): Promise<Family[]> => {
  const { data, error } = await supabase.from("families").select("id, name").order("name");
  if (error) throw new Error(error.message);
  return data;
};

const fetchCongregations = async (): Promise<Congregation[]> => {
  const { data, error } = await supabase.from("congregations").select("id, name").order("name");
  if (error) throw new Error(error.message);
  return data;
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

  const { data: members, isLoading: isLoadingMembers } = useQuery<Member[]>({ queryKey: ["members"], queryFn: fetchMembers });
  const { data: families, isLoading: isLoadingFamilies } = useQuery<Family[]>({ queryKey: ["familiesForMembers"], queryFn: fetchFamilies });
  const { data: congregations, isLoading: isLoadingCongregations } = useQuery<Congregation[]>({ queryKey: ["congregations"], queryFn: fetchCongregations });

  const mutation = useMutation({
    mutationFn: async (formData: { member: MemberFormValues; id?: string }) => {
      const { member, id } = formData;
      const { avatar_file, ...memberData } = member;

      const submissionData = {
        ...memberData,
        email: member.email || null,
        phone: member.phone || null,
        address: member.address || null,
        membership_date: member.membership_date || null,
        date_of_birth: member.date_of_birth || null,
        family_id: member.family_id || null,
        marital_status: member.marital_status || null,
        family_role: member.family_role || null,
      };

      let avatarUrl = selectedMember?.avatar_url;

      const handleUpload = async (file: File, targetId: string) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${targetId}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('member_photos').upload(filePath, file, { upsert: true });
        if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('member_photos').getPublicUrl(filePath);
        return `${publicUrl}?t=${new Date().getTime()}`;
      };

      if (id) { // UPDATE
        if (avatar_file?.[0]) {
          avatarUrl = await handleUpload(avatar_file[0], id);
        }
        const { error } = await supabase.from("members").update({ ...submissionData, avatar_url: avatarUrl }).eq("id", id);
        if (error) throw error;
      } else { // CREATE
        const { data: newMember, error } = await supabase.from("members").insert(submissionData).select().single();
        if (error) throw error;
        if (avatar_file?.[0]) {
          avatarUrl = await handleUpload(avatar_file[0], newMember.id);
          const { error: updateError } = await supabase.from("members").update({ avatar_url: avatarUrl }).eq("id", newMember.id);
          if (updateError) throw updateError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
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
      queryClient.invalidateQueries({ queryKey: ["members"] });
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
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <Avatar>
          <AvatarImage src={row.original.avatar_url || undefined} />
          <AvatarFallback>{row.original.first_name?.charAt(0)}{row.original.last_name?.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "first_name",
      header: "Nome",
      cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Telefone" },
    {
      accessorKey: "membership_date",
      header: "Membro Desde",
      cell: ({ row }) => row.original.membership_date ? new Date(row.original.membership_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
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

  const handleSubmit = (data: MemberFormValues) => {
    mutation.mutate({ member: data, id: selectedMember?.id });
  };

  const isLoading = isLoadingMembers || isLoadingFamilies || isLoadingCongregations || isLoadingProfile;
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
          <h1 className="text-3xl font-bold">Gestão de Pessoas</h1>
          <p className="mt-2 text-muted-foreground">Adicione, visualize e gerencie as pessoas da sua igreja.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild><Link to="/dashboard/members/dashboard"><BarChart className="mr-2 h-4 w-4" />Painel</Link></Button>
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

      <MembersDataTable columns={columns} data={members || []} />

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