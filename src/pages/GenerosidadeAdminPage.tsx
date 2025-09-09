import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GenerosityItem, GenerosityRequest, Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { Eye, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";

const fetchAdminData = async () => {
  const itemsPromise = supabase.from("generosity_items").select("*, profiles(full_name)").order("created_at", { ascending: false });
  const requestsPromise = supabase.from("generosity_requests").select("*, profiles!user_id(full_name), profiles!handled_by(full_name)").order("created_at", { ascending: false });
  const profilesPromise = supabase.from("profiles").select("id, full_name").order("full_name");

  const [
    { data: items, error: itemsError },
    { data: requests, error: requestsError },
    { data: profiles, error: profilesError }
  ] = await Promise.all([itemsPromise, requestsPromise, profilesPromise]);

  if (itemsError || requestsError || profilesError) {
    console.error(itemsError || requestsError || profilesError);
    throw new Error("Erro ao buscar dados de generosidade.");
  }
  return { items, requests, profiles };
};

const requestStatuses = ['Pendente', 'Em Análise', 'Atendido', 'Arquivado'];

const GenerosidadeAdminPage = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<GenerosityRequest | null>(null);
  const [internalNotes, setInternalNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["generosityAdminData"],
    queryFn: fetchAdminData,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async (updatedData: Partial<GenerosityRequest> & { id: string }) => {
      const { id, ...dataToUpdate } = updatedData;
      const { error } = await supabase.from("generosity_requests").update(dataToUpdate).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generosityAdminData"] });
      showSuccess("Solicitação atualizada com sucesso!");
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleNotesSave = () => {
    if (!selectedRequest) return;
    updateRequestMutation.mutate({ id: selectedRequest.id, internal_notes: internalNotes });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Generosidade</h1>
        <p className="mt-2 text-muted-foreground">Gerencie os itens doados e as solicitações de ajuda da comunidade.</p>
      </div>
      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Pedidos de Ajuda</TabsTrigger>
          <TabsTrigger value="items">Itens Doados</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <Card>
            <CardHeader><CardTitle>Solicitações Confidenciais</CardTitle><CardDescription>Total de {data?.requests?.length || 0} solicitações.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Solicitante</TableHead><TableHead>Status</TableHead><TableHead>Responsável</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? <TableRow><TableCell colSpan={5}><Skeleton className="h-24 w-full" /></TableCell></TableRow> :
                   data?.requests?.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{new Date(req.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{req.profiles?.full_name}</TableCell>
                      <TableCell><Select value={req.status} onValueChange={(status) => updateRequestMutation.mutate({ id: req.id, status })}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent>{requestStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></TableCell>
                      <TableCell><Select value={req.handled_by || ''} onValueChange={(handlerId) => updateRequestMutation.mutate({ id: req.id, handled_by: handlerId })}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Atribuir a..." /></SelectTrigger><SelectContent>{data?.profiles?.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select></TableCell>
                      <TableCell className="text-right">
                        <Dialog onOpenChange={(open) => { if (!open) setSelectedRequest(null); else { setSelectedRequest(req); setInternalNotes(req.internal_notes || ""); } }}>
                          <DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" /> Detalhes</Button></DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader><DialogTitle>Detalhes da Solicitação</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                              <p><strong>Solicitante:</strong> {selectedRequest?.profiles?.full_name}</p>
                              <div><strong>Necessidade:</strong><p className="text-sm text-muted-foreground p-2 border rounded-md mt-1">{selectedRequest?.request_details}</p></div>
                              <div><Label htmlFor="internal_notes" className="flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4" /> Anotações Internas</Label><Textarea id="internal_notes" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} /></div>
                              <Button onClick={handleNotesSave} disabled={updateRequestMutation.isPending}>Salvar Anotações</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                   ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="items">
          {/* Conteúdo para gerenciar itens doados pode ser adicionado aqui no futuro */}
          <Card><CardHeader><CardTitle>Gerenciamento de Itens Doados</CardTitle></CardHeader><CardContent><p>Em breve.</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenerosidadeAdminPage;