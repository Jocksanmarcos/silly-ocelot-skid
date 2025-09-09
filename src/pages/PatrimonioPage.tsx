import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Archive } from "lucide-react";
// Futuros componentes a serem criados
// import AssetForm from "@/components/patrimonio/AssetForm";
// import AssetsDataTable from "@/components/patrimonio/AssetsDataTable";

const fetchAssets = async (): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from("assets")
    .select("*, asset_categories(name), asset_locations(name), profiles(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const PatrimonioPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  const totalValue = assets?.reduce((sum, asset) => sum + (asset.current_value || 0), 0) || 0;

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Patrimônio</h1>
          <p className="mt-2 text-muted-foreground">
            Cadastre e gerencie os ativos e bens da sua igreja.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botão para gerenciar categorias/locais será adicionado aqui */}
          <Button onClick={() => { setSelectedAsset(null); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens Cadastrados</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total de itens no inventário.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Estimado</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">Soma dos valores atuais dos itens.</p>
          </CardContent>
        </Card>
      </div>

      {/* A tabela de dados será inserida aqui */}
      <Card>
        <CardHeader>
          <CardTitle>Inventário</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">A tabela de itens será implementada aqui.</p>
        </CardContent>
      </Card>

      {/* O Dialog para adicionar/editar será inserido aqui */}
    </div>
  );
};

export default PatrimonioPage;