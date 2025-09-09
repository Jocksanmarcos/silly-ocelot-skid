import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CounselingRequest, Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { Eye, MessageSquare } from "lucide-react";

const fetchRequests = async (): Promise<CounselingRequest[]> => {
  const { data, error } = await supabase.from("counseling_requests").select("*, profiles(full_name)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name");
  if (error) throw new Error(error.message);
  return data;
};

const statuses = ['Pendente', 'Em Análise', 'Agendado', 'Concluído', 'Arquivado'];

const AconselhamentoAdminPage = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<CounselingRequest | null>(null);
  const [internalNotes, setInternalNotes] = useState("");

  const { data: requests, isLoading: isLoadingRequests } = useQuery({ queryKey: ["counselingRequests"], queryFn: fetchRequests });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery({ queryKey: ["profilesForCounseling"], queryFn: fetchProfiles });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<CounselingRequest> & { id: string }) => {
      const { id, ...dataToUpdate } = updatedData;
      const { error } = await supabase.from("counseling_requests").update(dataToUpdate).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselingRequests"] });
      showSuccess("Solicitação atualizada com sucesso!");
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleNotesSave = () => {
    if (!selectedRequest) return;
    updateMutation.mutate({ id: selectedRequest.id, internal_notes: internalNotes });
  };

  const isLoading = isLoadingRequests || isLoadingProfiles;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Aconselhamento</h1>
        <p className="mt-2 text-muted-foreground">Gerencie com cuidado e confidencialidade todas as solicitações de aconselhamento.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Solicitações Recebidas</CardTitle><CardDescription>Total de {requests?.length || 0} solicitações.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atribuído a</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ) : requests && requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{new Date(req.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{req.requester_name}</TableCell>
                    <TableCell><Select value={req.status} onValueChange={(status) => updateMutation.mutate({ id: req.id, status })}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></TableCell>
                    <TableCell><Select value={req.assigned_to || ''} onValueChange={(pastorId) => updateMutation.mutate({ id: req.id, assigned_to: pastorId })}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Atribuir a..." /></SelectTrigger><SelectContent>{profiles?.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select></TableCell>
                    <TableCell className="text-right">
                      <Dialog onOpenChange={(open) => { if (!open) setSelectedRequest(null); else { setSelectedRequest(req); setInternalNotes(req.internal_notes || ""); } }}>
                        <DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" /> Detalhes</Button></DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader><DialogTitle>Detalhes da Solicitação</DialogTitle></DialogHeader>
                          <div className="space-y-4 py-4">
                            <p><strong>Nome:</strong> {selectedRequest?.requester_name}</p>
                            <p><strong>Email:</strong> {selectedRequest?.requester_contact_email || 'Não informado'}</p>
                            <p><strong>Telefone:</strong> {selectedRequest?.requester_contact_phone || 'Não informado'}</p>
                            <p><strong>Contato Preferencial:</strong> {selectedRequest?.preferred_contact_method}</p>
                            <div><strong>Assunto:</strong><p className="text-sm text-muted-foreground p-2 border rounded-md mt-1">{selectedRequest?.reason_summary || 'Não informado'}</p></div>
                            <div><Label htmlFor="internal_notes" className="flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4" /> Anotações Internas (Confidencial)</Label><Textarea id="internal_notes" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Adicione notas sobre o andamento, agendamentos, etc." /></div>
                            <Button onClick={handleNotesSave} disabled={updateMutation.isPending}>Salvar Anotações</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhuma solicitação de aconselhamento encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AconselhamentoAdminPage;