import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/types";
import { MemberFormValues } from "@/lib/schemas";
import { MembersDataTable } from "@/components/members/MembersDataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { showSuccess, showError } from "@/utils/toast";
import MemberForm from "@/components/members/MemberForm";
import { Skeleton } from "@/components/ui/skeleton";

const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const MembersPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const mutation = useMutation({
    mutationFn: async (formData: { member: MemberFormValues; id?: string }) => {
      const { member, id } = formData;
      const { error } = id
        ? await supabase.from("members").update(member).eq("id", id)
        : await supabase.from("members").insert(member);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      showSuccess(`Membro ${selectedMember ? 'atualizado' : 'adicionado'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error) => {
      showError(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      showSuccess("Membro removido com sucesso!");
      setIsAlertOpen(false);
      setSelectedMember(null);
    },
    onError: (error) => {
      showError(`Erro: ${error.message}`);
    },
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
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleSubmit = (data: MemberFormValues) => {
    mutation.mutate({ member: data, id: selectedMember?.id });
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Membros</h1>
          <p className="mt-2 text-muted-foreground">Adicione, visualize e gerencie os membros da sua igreja.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedMember(null);
        }}>
          <DialogTrigger asChild>
            <Button>Adicionar Membro</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedMember ? "Editar Membro" : "Adicionar Novo Membro"}</DialogTitle>
            </DialogHeader>
            <MemberForm 
              onSubmit={handleSubmit} 
              defaultValues={selectedMember || undefined}
              isSubmitting={mutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <MembersDataTable columns={columns} data={members || []} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente o membro dos seus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMember(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedMember && deleteMutation.mutate(selectedMember.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MembersPage;