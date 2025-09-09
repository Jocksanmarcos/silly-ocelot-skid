import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventRegistration } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail, User } from "lucide-react";

type RegistrationWithEvent = EventRegistration & {
  events: {
    title: string;
    event_date: string;
  } | null;
};

const fetchRegistration = async (id: string): Promise<RegistrationWithEvent> => {
  const { data, error } = await supabase
    .from("event_registrations")
    .select("*, events(title, event_date)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const RegistrationConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: registration, isLoading, isError } = useQuery({
    queryKey: ["registration", id],
    queryFn: () => fetchRegistration(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container py-12 max-w-2xl mx-auto">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !registration) {
    return <div className="container py-12 text-center">Inscrição não encontrada.</div>;
  }

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Inscrição Confirmada!</CardTitle>
          <CardDescription>Apresente este QR Code na entrada do evento.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeCanvas value={registration.id} size={200} />
          </div>
          <div className="w-full space-y-4 text-left">
             <h3 className="text-lg font-semibold border-b pb-2">{registration.events?.title}</h3>
             <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{registration.full_name}</span>
             </div>
             <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{registration.email}</span>
             </div>
             <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{new Date(registration.events?.event_date || '').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationConfirmationPage;