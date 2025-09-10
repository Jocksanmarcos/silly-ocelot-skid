import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import RegistrationForm from "@/components/events/RegistrationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const fetchEvent = async (id: string): Promise<Event> => {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
};

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: event, isLoading, isError } = useQuery<Event>({
    queryKey: ["event", id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return <div className="container py-12 text-center">Evento não encontrado.</div>;
  }

  const isFree = !event.price || event.price === 0;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold tracking-tighter mb-2">{event.title}</h1>
      <p className="text-xl text-muted-foreground mb-8">
        {new Date(event.event_date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="w-full h-auto aspect-video object-cover rounded-lg" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Sobre o Evento</h2>
            <p className="text-muted-foreground">{event.description || "Nenhuma descrição fornecida."}</p>
          </div>
          {event.gallery_urls && event.gallery_urls.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Galeria</h2>
              <Carousel className="w-full max-w-full">
                <CarouselContent>
                  {event.gallery_urls.map((url, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <img src={url} alt={`Galeria do evento ${index + 1}`} className="aspect-square w-full object-cover rounded-lg" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{new Date(event.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{event.location || "Local a definir"}</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>{isFree ? "Gratuito" : `R$ ${event.price?.toFixed(2).replace('.', ',')}`}</span>
              </div>
              {event.capacity && event.capacity > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Capacidade: {event.capacity} pessoas</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full">{isFree ? "Inscrever-se Gratuitamente" : "Comprar Ingresso"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inscrição para {event.title}</DialogTitle>
              </DialogHeader>
              <RegistrationForm event={event} onFinished={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;