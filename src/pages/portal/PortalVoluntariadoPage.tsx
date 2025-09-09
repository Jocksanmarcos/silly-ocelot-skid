import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ministry } from "@/types";
import { useAuth } from "@/contexts/AuthProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

const fetchMinistries = async (): Promise<Ministry[]> => {
  const { data, error } = await supabase.from("ministries").select("*, profiles(full_name)").order("name");
  if (error) throw new Error(error.message);
  return data;
};

const PublicVoluntariadoPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [notes, setNotes] = useState("");

  const { data: ministries, isLoading } = useQuery({ queryKey: ["publicMinistries"], queryFn: fetchMinistries });

  const volunteerMutation = useMutation({
    mutationFn: async () => {
      if (!session || !selectedMinistry) throw new Error("Você precisa estar logado e selecionar um ministério.");
      const { error } = await supabase.from("volunteers").insert({
        user_id: session.user.id,
        ministry_id: selectedMinistry.id,
        notes: notes,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      showSuccess("Inscrição enviada com sucesso! A liderança entrará em contato em breve.");
      setSelectedMinistry(null);
      setNotes("");
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleVolunteerClick = (ministry: Ministry) => {
    if (!session) {
      navigate('/login');
    } else {
      setSelectedMinistry(ministry);
    }
  };

  const handleSubmit = () => {
    volunteerMutation.mutate();
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Sirva Conosco</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Encontre um lugar para usar seus dons e talentos. Fazer parte de um ministério é uma forma poderosa de crescer e abençoar nossa comunidade.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-64" />)
          ) : ministries?.map(ministry => (
            <Card key={ministry.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{ministry.name}</CardTitle>
                <CardDescription>Líder: {ministry.profiles?.full_name || 'A definir'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-4">{ministry.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleVolunteerClick(ministry)}>Quero Servir</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedMinistry} onOpenChange={(open) => !open && setSelectedMinistry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Inscrição em {selectedMinistry?.name}</DialogTitle>
            <DialogDescription>
              Que alegria saber do seu interesse! Se desejar, deixe uma mensagem para o líder do ministério.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="notes">Sua Mensagem (Opcional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Tenho experiência com crianças, gostaria de ajudar aos domingos, etc." />
          </div>
          <Button onClick={handleSubmit} disabled={volunteerMutation.isPending}>
            {volunteerMutation.isPending ? "Enviando..." : "Enviar meu Interesse"}
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PublicVoluntariadoPage;