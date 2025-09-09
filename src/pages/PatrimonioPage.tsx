import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Asset, AssetCategory, AssetLocation, Profile } from "@/types";
import { AssetFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Archive, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { showSuccess, showError } from "@/utils/toast";
import AssetForm from "@/components/patrimonio/AssetForm";

const fetchAssets = async (): Promise<Asset[]> => {
  const { data, error } = await supabase.from("assets").select("*, asset_categories(name), asset_locations(name), profiles(full_name)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchRelatedData = async () => {
  const categoriesPromise = supabase.from("asset_categories").select("*");
  const locationsPromise = supabase.from("asset_locations").select("*");
  const profilesPromise = supabase.from("profiles").select("id, full_name");
  const [{ data: categories }, { data: locations }, { data: profiles }] = await Promise.all([categoriesPromise, locationsPromise, profilesPromise]);
  return { categories: categories || [], locations: locations || [], profiles: profiles || [] };
};

const PatrimonioPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { data: assets, isLoading: isLoadingAssets } = useQuery<Asset[]>({ queryKey: ["assets"], queryFn: fetchAssets });
  const { data: relatedData, isLoading: isLoadingRelated } = useQuery({ queryKey: ["assetRelatedData"], queryFn: fetchRelatedData });

  const mutation = useMutation({
    mutationFn: async (formData: { data: AssetFormValues; id?: string }) => {
      const { data, id } = formData;
      const { error } = id ? await supabase.from("assets").update(data).eq("id", id) : await supabase.from("assets").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      showSuccess(`Item ${selectedAsset ? 'atualizado' : 'adicionado'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedAsset(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const totalValue = assets?.reduce((sum, asset) => sum + (asset.current_value || 0), 0) || 0;
  const isLoading = isLoadingAssets || isLoadingRelated;

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: AssetFormValues) => {
    mutation.mutate({ data, id: selectedAsset?.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Patrimônio</h1>
          <p className="mt-2 text-muted-foreground">Cadastre e gerencie os ativos e bens da sua igreja.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedAsset(null); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item</Button></DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>{selectedAsset ? "Editar Item" : "Adicionar Novo Item"}</DialogTitle></DialogHeader>
            {relatedData && <AssetForm onSubmit={handleSubmit} defaultValues={selectedAsset || undefined} isSubmitting={mutation.isPending} {...relatedData} />}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Itens Cadastrados</CardTitle><Archive className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : assets?.length || 0}</div><p className="text-xs text-muted-foreground">Total de itens no inventário.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Valor Total Estimado</CardTitle><Archive className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-32" /> : `R$ ${totalValue.toFixed(2).replace('.', ',')}`}</div><p className="text-xs text-muted-foreground">Soma dos valores atuais dos itens.</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventário</CardTitle><CardDescription>Lista de todos os itens cadastrados.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Categoria</TableHead><TableHead>Localização</TableHead><TableHead>Status</TableHead><TableHead>Valor Atual</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6}><Skeleton className="h-24 w-full" /></TableCell></TableRow> :
               assets?.map(asset => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.asset_categories?.name || 'N/A'}</TableCell>
                  <TableCell>{asset.asset_locations?.name || 'N/A'}</TableCell>
                  <TableCell>{asset.status}</TableCell>
                  <TableCell>R$ {asset.current_value?.toFixed(2).replace('.', ',') || '0,00'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(asset)}>Editar</DropdownMenuItem>
                        {/* Futura ação de manutenção aqui */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
               ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatrimonioPage;