import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Congregation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { PlusCircle } from 'lucide-react';

const fetchCongregations = async (): Promise<Congregation[]> => {
  const { data, error } = await supabase.from('congregations').select('*').order('name');
  if (error) throw error;
  return data;
};

const CongregationsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Congregation | null>(null);
  const [itemName, setItemName] = useState('');

  const { data: congregations } = useQuery({ queryKey: ['congregations'], queryFn: fetchCongregations });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = selectedItem?.id
        ? await supabase.from('congregations').update({ name: itemName }).eq('id', selectedItem.id)
        : await supabase.from('congregations').insert({ name: itemName });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['congregations'] });
      showSuccess('Operação realizada com sucesso!');
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleOpenDialog = (item: Congregation | null) => {
    setSelectedItem(item);
    setItemName(item?.name || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Gestão de Missões/Sedes</h1>
            <p className="mt-2 text-muted-foreground">Adicione ou edite as missões e sedes da igreja.</p>
        </div>
        <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2 h-4 w-4" /> Nova Missão/Sede</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Missões/Sedes</CardTitle>
          <CardDescription>{congregations?.length || 0} cadastradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {congregations?.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)}>Editar</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedItem?.id ? 'Editar' : 'Adicionar'} Missão/Sede</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" value={itemName} onChange={(e) => setItemName(e.target.value)} required /></div>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CongregationsPage;