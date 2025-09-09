import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { GenerosityItem } from "@/types";
import { DonationFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, HeartHandshake } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import ItemCard from "@/components/mural/ItemCard";
import DonationForm from "@/components/mural/DonationForm";

const fetchItems = async (): Promise<GenerosityItem[]> => {
  const { data, error } = await supabase
    .from("generosity_items")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const MuralDaGenerosidadePage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["generosity_items"],
    queryFn: fetchItems,
  });

  const mutation = useMutation({
    mutationFn: async (formData: DonationFormValues) => {
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        const uploadPromises = Array.from(formData.images).map(async (file: any) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${session!.user.id}/${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('generosity_items').upload(fileName, file);
          if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);
          const { data: { publicUrl } } = supabase.storage.from('generosity_items').getPublicUrl(fileName);
          return publicUrl;
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      const { error } = await supabase.from("generosity_items").insert({
        user_id: session!.user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image_urls: imageUrls,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generosity_items"] });
      showSuccess("Sua doação foi publicada. Obrigado por sua generosidade!");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleSubmit = (data: DonationFormValues) => {
    mutation.mutate(data);
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
            <TabsTrigger value="doacoes">Itens para Doar</TabsTrigger>
            <TabsTrigger value="necessidades" disabled>Necessidades da Comunidade</TabsTrigger>
          </TabsList>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Oferecer Doação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Oferecer um item para doação</DialogTitle></DialogHeader>
              <DonationForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="doacoes">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)
            ) : items && items.length > 0 ? (
              items.map(item => <ItemCard key={item.id} item={item} />)
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">Nenhum item disponível para doação no momento.</p>
                <p className="text-sm text-muted-foreground">Seja o primeiro a abençoar alguém!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MuralDaGenerosidadePage;