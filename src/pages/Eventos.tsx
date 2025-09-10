import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq('type', 'externo') // Apenas eventos públicos
    .order("event_date", { ascending: true })
    .gte("event_date", new Date().toISOString()); // Apenas eventos futuros
  if (error) throw new Error(error.message);
  return data;
};

const Eventos = () => {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["publicEvents"],
    queryFn: fetchEvents,
  });

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Próximos Eventos</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Fique por dentro de tudo o que acontece na nossa comunidade. Participe!
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-28" />
                </CardFooter>
              </Card>
            ))
          ) : events && events.length > 0 ? (
            events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{event.description || "Veja mais detalhes sobre este evento."}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link to={`/eventos/${event.id}`}>Saiba Mais</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">Nenhum evento futuro encontrado.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Eventos;