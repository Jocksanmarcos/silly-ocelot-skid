import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { GenerosityItem } from "@/types";
import { DonationFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, HeartHandshake } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import ItemCard from "@/components/mural/ItemCard";
import DonationForm from "@/components/mural/DonationForm";
import MyDonationsTab from "@/components/mural/MyDonationsTab";

const fetchItems = async (): Promise<GenerosityItem[]> => {
  const { data, error } = await supabase
    .from("generosity_items")
    .select("*, profiles!user_id(full_name, avatar_url), reserved_by:profiles!reserved_by_user_id(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const MuralDaGenerosidadePage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GenerosityItem | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["generosity_items"],
    queryFn: fetchItems,
  });

  const myItems = useMemo(() => {
    if (!items || !session) return [];
    return items.filter(item => item.user_id === session.user.id);
  }, [items, session]);

  const mutation = useMutation({
    mutationFn: async (formData: { data: DonationFormValues, id?: string }) => {
      const { data, id } = formData;
      let imageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        const uploadPromises = Array.from(data.images).map(async (file: any) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${session!.user.id}/${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('generosity_items').upload(fileName, file);
          if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);
          const { data: { publicUrl } } = supabase.storage.from('generosity_items').getPublicUrl(fileName);
          return publicUrl;
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      const itemData = {
        user_id: session!.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        ...(imageUrls.length > 0 && { image_urls: imageUrls }),
      };

      const { error } = id
        ? await supabase.from("generosity_items").update(itemData).eq("id", id)
        : await supabase.from("generosity_items").insert(itemData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generosity_items"] });
      showSuccess(`Item ${selectedItem ? 'atualizado' : 'publicado'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: Error) => showError(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string, status: GenerosityItem['status'] }) => {
      let updateData: Partial<GenerosityItem> = { status };
      if (status === 'Disponível') {
        updateData.reserved_by_user_id = null;
        updateData.requester_contact = null;
      }
      const { error } = await supabase.from("generosity_items").update(updateData).eq("id", itemId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generosity_items"] });
      showSuccess("Status do item atualizado!");
    },
    onError: (error: Error) => showError(error.message),
  });

  const interestMutation = useMutation({
    mutationFn: async (item: GenerosityItem) => {
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('phone, email')
        .eq('user_id', session!.user.id)
        .single();
      if (memberError && memberError.code !== 'PGRST116') throw new Error(memberError.message);

      const contactInfo = memberData?.phone || memberData?.email || 'Contato não disponível';

      const { error } = await supabase
        .from('generosity_items')
        .update({ 
          status: 'Reservado',
          reserved_by_user_id: session!.user.id,
          requester_contact: contactInfo,
        })
        .eq('id', item.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generosity_items"] });
      showSuccess("Interesse registrado! O doador foi notificado para entrar em contato.");
    },
    onError: (error: Error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("generosity_items").delete().eq("id", itemId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generosity_items"] });
      showSuccess("Item removido com sucesso.");
      setIsAlertOpen(false);
      setSelectedItem(null);
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleEdit = (item: GenerosityItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: GenerosityItem) => {
    setSelectedItem(item);
    setIsAlertOpen(true);
  };

  const handleSubmit = (data: DonationFormValues) => {
    mutation.mutate({ data, id: selectedItem?.id });
  };

  return (
    <div className="container py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <HeartHandshake className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tighter">Mural da Generosidade</h1>
        <p className="max-w-2xl text-muted-foreground mt-2">
          Um espaço para abençoar e ser abençoado. Doe o que você não usa mais ou encontre algo que precisa.
        </p>
      </div>

      <Tabs defaultValue="doacoes">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="doacoes">Todas as Doações</TabsTrigger>
            <TabsTrigger value="meus-itens">Minhas Doações</TabsTrigger>
          </TabsList>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedItem(null); }}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Oferecer Doação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{selectedItem ? 'Editar Item' : 'Oferecer um item para doação'}</DialogTitle></DialogHeader>
              <DonationForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="doacoes">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)
            ) : items && items.length > 0 ? (
              items.map(item => <ItemCard key={item.id} item={item} onInterestClick={() => interestMutation.mutate(item)} />)
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">Nenhum item disponível para doação no momento.</p>
                <p className="text-sm text-muted-foreground">Seja o primeiro a abençoar alguém!</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="meus-itens">
            <MyDonationsTab 
                items={myItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={(itemId, status) => statusMutation.mutate({ itemId, status })}
            />
        </TabsContent>
      </Tabs>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{selectedItem?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedItem(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(selectedItem!.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removendo..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MuralDaGenerosidadePage;