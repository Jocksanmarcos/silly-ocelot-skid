import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetMaintenance } from '@/types';
import { MaintenanceFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, PlusCircle, Wrench } from 'lucide-react';
import MaintenanceForm from '@/components/patrimonio/MaintenanceForm';

const fetchAssetDetails = async (assetId: string) => {
  const assetPromise = supabase.from('assets').select('*, asset_categories(name), asset_locations(name), profiles(full_name)').eq('id', assetId).single();
  const maintenancePromise = supabase.from('asset_maintenance').select('*').eq('asset_id', assetId).order('maintenance_date', { ascending: false });
  const [{ data: asset, error: assetError }, { data: maintenance, error: maintenanceError }] = await Promise.all([assetPromise, maintenancePromise]);
  if (assetError) throw new Error(`Erro ao buscar ativo: ${assetError.message}`);
  if (maintenanceError) throw new Error(`Erro ao buscar manutenções: ${maintenanceError.message}`);
  return { asset, maintenance };
};

const AssetDetailPage = () => {
  const { id: assetId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['assetDetails', assetId],
    queryFn: () => fetchAssetDetails(assetId!),
    enabled: !!assetId,
  });

  const mutation = useMutation({
    mutationFn: async (formData: MaintenanceFormValues) => {
      const { error } = await supabase.from('asset_maintenance').insert({ asset_id: assetId, ...formData });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetDetails', assetId] });
      showSuccess('Registro de manutenção adicionado!');
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  if (isLoading) return <div><Skeleton className="h-96 w-full" /></div>;

  const { asset, maintenance } = data || {};

  return (
    <div className="space-y-6">
      <Link to="/dashboard/patrimonio" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar para o Inventário
      </Link>
      <Card>
        <CardHeader><CardTitle>{asset?.name}</CardTitle><CardDescription>{asset?.description}</CardDescription></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div><strong>Categoria:</strong> {asset?.asset_categories?.name || 'N/A'}</div>
          <div><strong>Localização:</strong> {asset?.asset_locations?.name || 'N/A'}</div>
          <div><strong>Responsável:</strong> {asset?.profiles?.full_name || 'N/A'}</div>
          <div><strong>Status:</strong> {asset?.status}</div>
          <div><strong>Nº de Série:</strong> {asset?.serial_number || 'N/A'}</div>
          <div><strong>Valor Atual:</strong> R$ {asset?.current_value?.toFixed(2).replace('.', ',') || '0,00'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Histórico de Manutenção</CardTitle><CardDescription>Registros de todos os serviços realizados.</CardDescription></div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Registro</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Nova Manutenção</DialogTitle></DialogHeader><MaintenanceForm onSubmit={(data) => mutation.mutate(data)} isSubmitting={mutation.isPending} /></DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead>Fornecedor</TableHead><TableHead className="text-right">Custo</TableHead></TableRow></TableHeader>
            <TableBody>
              {maintenance && maintenance.length > 0 ? maintenance.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{new Date(m.maintenance_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                  <TableCell>{m.description}</TableCell>
                  <TableCell>{m.provider || 'N/A'}</TableCell>
                  <TableCell className="text-right">R$ {m.cost?.toFixed(2).replace('.', ',') || '0,00'}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum registro de manutenção encontrado.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetDetailPage;