import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventRegistration } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, CheckCircle, ScanLine, XCircle } from 'lucide-react';
import QRCodeScanner from '@/components/events/QRCodeScanner';

type RegistrationWithEvent = EventRegistration & { events: Pick<Event, 'title'> | null };

const fetchEventAndRegistrations = async (eventId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*, events(title)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as RegistrationWithEvent[];
};

const EventRegistrationsPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['event_registrations', eventId],
    queryFn: () => fetchEventAndRegistrations(eventId!),
    enabled: !!eventId,
  });

  const checkInMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { data: existing, error: fetchError } = await supabase
        .from('event_registrations')
        .select('full_name, checked_in')
        .eq('id', registrationId)
        .single();

      if (fetchError || !existing) throw new Error('Inscrição não encontrada.');
      if (existing.checked_in) throw new Error(`${existing.full_name} já fez check-in.`);

      const { error: updateError } = await supabase
        .from('event_registrations')
        .update({ checked_in: true })
        .eq('id', registrationId);

      if (updateError) throw new Error(updateError.message);
      return existing.full_name;
    },
    onSuccess: (name) => {
      queryClient.invalidateQueries({ queryKey: ['event_registrations', eventId] });
      showSuccess(`Check-in de ${name} realizado com sucesso!`);
      setIsScannerOpen(false);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleScanSuccess = (decodedText: string) => {
    checkInMutation.mutate(decodedText);
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const eventTitle = registrations?.[0]?.events?.title || 'Evento';
  const checkedInCount = registrations?.filter(r => r.checked_in).length || 0;
  const totalCount = registrations?.length || 0;

  return (
    <div>
      <Link to="/dashboard/events" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Eventos
      </Link>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Check-in: {eventTitle}</h1>
          <p className="mt-2 text-muted-foreground">
            {checkedInCount} de {totalCount} participantes presentes.
          </p>
        </div>
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogTrigger asChild>
            <Button>
              <ScanLine className="mr-2 h-4 w-4" />
              Escanear QR Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aponte a câmera para o QR Code</DialogTitle>
            </DialogHeader>
            <QRCodeScanner
              onScanSuccess={handleScanSuccess}
              onScanFailure={(error) => console.error(error)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscrições</CardTitle>
          <CardDescription>Lista de todos os participantes inscritos no evento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Check-in</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations && registrations.length > 0 ? (
                registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.full_name}</TableCell>
                    <TableCell>{reg.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {reg.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {reg.checked_in ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reg.checked_in || checkInMutation.isPending}
                        onClick={() => checkInMutation.mutate(reg.id)}
                      >
                        Check-in Manual
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma inscrição encontrada para este evento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventRegistrationsPage;