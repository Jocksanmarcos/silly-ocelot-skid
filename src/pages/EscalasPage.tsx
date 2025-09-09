import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorshipEvent, WorshipTeam } from "@/types";
import { ScaleFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { PlusCircle, ArrowLeft } from "lucide-react";
import ScaleForm from "@/components/louvor/ScaleForm";
import { Link } from "react-router-dom";

const fetchScalesData = async () => {
  const scalesPromise = supabase.from("worship_events").select("*, worship_teams(name)").order("event_date", { ascending: false });
  const teamsPromise = supabase.from("worship_teams").select("*");
  
  const [{ data: scales, error: scalesError }, { data: teams, error: teamsError }] = await Promise.all([scalesPromise, teamsPromise]);

  if (scalesError || teamsError) throw new Error(scalesError?.message || teamsError?.message);
  return { scales, teams };
};

const EscalasPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["scalesData"],
    queryFn: fetchScalesData,
  });

  const mutation = useMutation({
    mutationFn: async (formData: ScaleFormValues) => {
      const { error } = await supabase.from("worship_events").insert(formData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scalesData"] });
      showSuccess("Escala criada com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  return (
    <div className="space-y-6">
      <Link to="/dashboard/louvor" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Central de Louvor
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciador de Escalas</h1>
          <p className="mt-2 text-muted-foreground">Crie e visualize as próximas escalas do ministério.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Criar Escala</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Nova Escala de Louvor</DialogTitle></DialogHeader><ScaleForm onSubmit={(data) => mutation.mutate(data)} isSubmitting={mutation.isPending} teams={data?.teams || []} /></DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Próximas Escalas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Evento</TableHead><TableHead>Data</TableHead><TableHead>Equipe</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-24 w-full" /></TableCell></TableRow> :
               data?.scales?.map(scale => (
                <TableRow key={scale.id}>
                  <TableCell className="font-medium">{scale.title}</TableCell>
                  <TableCell>{new Date(scale.event_date).toLocaleString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                  <TableCell>{scale.worship_teams?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" asChild><Link to={`/dashboard/louvor/escalas/${scale.id}`}>Detalhes</Link></Button></TableCell>
                </TableRow>
               ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalasPage;