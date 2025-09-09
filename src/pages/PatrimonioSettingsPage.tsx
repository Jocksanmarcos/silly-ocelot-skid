import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AssetCategory, AssetLocation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess, showError } from '@/utils/toast';
import { PlusCircle } from 'lucide-react';

type Item = AssetCategory | AssetLocation;

const PatrimonioSettingsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<{ item: Item | null, type: 'category' | 'location' }>({ item: null, type: 'category' });
  const [itemName, setItemName] = useState('');

  const { data: categories, isLoading: isLoadingCategories } = useQuery({ queryKey: ['assetCategories'], queryFn: async () => {
    const { data, error } = await supabase.from('asset_categories').select('*');
    if (error) throw error;
    return data;
  }});
  const { data: locations, isLoading: isLoadingLocations } = useQuery({ queryKey: ['assetLocations'], queryFn: async () => {
    const { data, error } = await supabase.from('asset_locations').select('*');
    if (error) throw error;
    return data;
  }});

  const mutation = useMutation({
    mutationFn: async () => {
      const table = currentItem.type === 'category' ? 'asset_categories' : 'asset_locations';
      const { error } = currentItem.item?.id
        ? await supabase.from(table).update({ name: itemName }).eq('id', currentItem.item.id)
        : await supabase.from(table).insert({ name: itemName });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
      queryClient.invalidateQueries({ queryKey: ['assetLocations'] });
      showSuccess('Operação realizada com sucesso!');
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleOpenDialog = (item: Item | null, type: 'category' | 'location') => {
    setCurrentItem({ item, type });
    setItemName(item?.name || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const renderTable = (items: Item[] | undefined, type: 'category' | 'location') => (
    <Table>
      <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
      <TableBody>
        {items?.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleOpenDialog(item, type)}>Editar</Button></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações do Patrimônio</h1>
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="locations">Localizações</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Categorias de Itens</CardTitle>
              <Button onClick={() => handleOpenDialog(null, 'category')}><PlusCircle className="mr-2 h-4 w-4" /> Nova Categoria</Button>
            </CardHeader>
            <CardContent>{renderTable(categories, 'category')}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="locations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Localizações</CardTitle>
              <Button onClick={() => handleOpenDialog(null, 'location')}><PlusCircle className="mr-2 h-4 w-4" /> Nova Localização</Button>
            </CardHeader>
            <CardContent>{renderTable(locations, 'location')}</CardContent>
          </Card>
        </Card>
      </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentItem.item?.id ? 'Editar' : 'Adicionar'} {currentItem.type === 'category' ? 'Categoria' : 'Localização'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" value={itemName} onChange={(e) => setItemName(e.target.value)} required /></div>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatrimonioSettingsPage;