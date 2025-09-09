import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fetchPublicEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("visibility", "public");
  if (error) throw new Error(error.message);
  return data;
};

const PublicAgendaPage = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["publicCalendarEvents"],
    queryFn: fetchPublicEvents,
  });

  const formattedEvents = events?.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    allDay: event.is_all_day,
    color: event.category === 'Feriado' ? '#ef4444' : '#3b82f6',
  }));

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Agenda da Comunidade</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Fique por dentro de todos os nossos cultos, reuniões e eventos.
          </p>
        </div>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-[800px] w-full" />
            ) : (
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={formattedEvents}
                locale="pt-br"
                buttonText={{
                    today:    'Hoje',
                    month:    'Mês',
                    week:     'Semana',
                    day:      'Dia',
                }}
                height="auto"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PublicAgendaPage;