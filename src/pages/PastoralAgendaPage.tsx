import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types';
import { CalendarEventFormValues } from '@/lib/schemas';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg, EventChangeArg } from '@fullcalendar/core';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import EventForm from '@/components/agenda/EventForm';
import { useAuth } from '@/contexts/AuthProvider';

const fetchSupabaseEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase.from("calendar_events").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const fetchGoogleEvents = async (): Promise<any[]> => {
  const { data, error } = await supabase.functions.invoke('fetch-google-calendar-events');
  if (error) {
    console.error("Failed to fetch Google Calendar events:", error.message);
    showError("Não foi possível carregar os eventos do Google Calendar.");
    return [];
  }
  return data || [];
};

const PastoralAgendaPage = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedEventInfo, setSelectedEventInfo] = useState<Partial<CalendarEventFormValues> & { id?: string } | null>(null);

  const { data: supabaseEvents, isLoading: isLoadingSupabase } = useQuery({
    queryKey: ["allCalendarEvents"],
    queryFn: fetchSupabaseEvents,
  });

  const { data: googleEvents, isLoading: isLoadingGoogle } = useQuery({
    queryKey: ["googleCalendarEvents"],
    queryFn: fetchGoogleEvents,
  });

  const isLoading = isLoadingSupabase || isLoadingGoogle;

  const mutation = useMutation({
    mutationFn: async (formData: { event: CalendarEventFormValues; id?: string }) => {
      const { event, id } = formData;
      const eventData = { ...event, created_by: session?.user.id };
      const { error } = id
        ? await supabase.from("calendar_events").update(eventData).eq("id", id)
        : await supabase.from("calendar_events").insert(eventData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCalendarEvents"] });
      queryClient.invalidateQueries({ queryKey: ["publicCalendarEvents"] });
      showSuccess(`Evento ${selectedEventInfo?.id ? 'atualizado' : 'criado'} com sucesso!`);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCalendarEvents"] });
      queryClient.invalidateQueries({ queryKey: ["publicCalendarEvents"] });
      showSuccess("Evento removido com sucesso!");
      setIsAlertOpen(false);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEventInfo({
      start_time: selectInfo.startStr,
      end_time: selectInfo.endStr,
      is_all_day: selectInfo.allDay,
    });
    setIsDialogOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (clickInfo.event.extendedProps.googleEvent) {
      showError("Eventos do Google Calendar são somente leitura e não podem ser editados aqui.");
      return;
    }
    const event = clickInfo.event;
    setSelectedEventInfo({
      id: event.id,
      title: event.title,
      description: event.extendedProps.description || '',
      start_time: event.startStr,
      end_time: event.endStr,
      is_all_day: event.allDay,
      visibility: event.extendedProps.visibility || 'public',
      category: event.extendedProps.category || '',
    });
    setIsDialogOpen(true);
  };
  
  const handleEventChange = (changeInfo: EventChangeArg) => {
    if (changeInfo.event.extendedProps.googleEvent) {
        showError("Eventos do Google Calendar não podem ser movidos aqui.");
        changeInfo.revert();
        return;
    }
    mutation.mutate({
      id: changeInfo.event.id,
      event: {
        title: changeInfo.event.title,
        start_time: changeInfo.event.startStr,
        end_time: changeInfo.event.endStr,
        is_all_day: changeInfo.event.allDay,
        visibility: changeInfo.event.extendedProps.visibility,
        description: changeInfo.event.extendedProps.description,
        category: changeInfo.event.extendedProps.category,
      },
    });
  };

  const handleSubmit = (data: CalendarEventFormValues) => {
    mutation.mutate({ event: data, id: selectedEventInfo?.id });
  };

  const formattedEvents = useMemo(() => {
    const supabaseFormatted = supabaseEvents?.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      allDay: event.is_all_day,
      extendedProps: {
          description: event.description,
          visibility: event.visibility,
          category: event.category,
          googleEvent: false,
      },
      color: event.visibility === 'private' ? '#6b7280' : (event.category === 'Feriado' ? '#ef4444' : '#3b82f6'),
    })) || [];

    return [...supabaseFormatted, ...(googleEvents || [])];
  }, [supabaseEvents, googleEvents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agenda Pastoral e da Igreja</h1>
        <p className="mt-2 text-muted-foreground">Clique em uma data para adicionar um evento ou em um evento existente para editá-lo.</p>
      </div>
      <Card>
        <CardContent className="p-4">
          {isLoading ? <Skeleton className="h-[800px] w-full" /> : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
              initialView="dayGridMonth"
              events={formattedEvents}
              locale="pt-br"
              buttonText={{ today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' }}
              height="auto"
              selectable={true}
              editable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventChange={handleEventChange}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEventInfo?.id ? 'Editar Evento' : 'Adicionar Novo Evento'}</DialogTitle>
          </DialogHeader>
          <EventForm onSubmit={handleSubmit} defaultValues={selectedEventInfo || {}} isSubmitting={mutation.isPending} />
          {selectedEventInfo?.id && (
            <Button variant="destructive" className="mt-4" onClick={() => setIsAlertOpen(true)} disabled={deleteMutation.isPending}>
              Remover Evento
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar Remoção</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover este evento? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(selectedEventInfo!.id!)}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PastoralAgendaPage;