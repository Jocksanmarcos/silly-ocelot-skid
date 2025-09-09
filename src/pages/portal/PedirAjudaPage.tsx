import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenerosityRequestFormValues, generosityRequestSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { showSuccess, showError } from '@/utils/toast';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const PedirAjudaPage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<GenerosityRequestFormValues>({
    resolver: zodResolver(generosityRequestSchema),
    defaultValues: {
      request_details: "",
      is_anonymous: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: GenerosityRequestFormValues) => {
      const { error } = await supabase.from("generosity_requests").insert({
        ...data,
        user_id: session!.user.id,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generosity_requests"] });
      showSuccess("Sua solicitação foi enviada com sucesso.");
      setIsSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      showError(`Erro ao enviar: ${error.message}`);
    },
  });

  const onSubmit = (data: GenerosityRequestFormValues) => {
    mutation.mutate(data);
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Solicitar Ajuda</CardTitle>
            <CardDescription className="text-muted-foreground">
              Este é um canal seguro e confidencial. Sua solicitação será enviada diretamente à nossa equipe de Ação Social.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center space-y-4 py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-semibold">Recebemos seu pedido!</h3>
                <p className="text-muted-foreground">
                  Agradecemos por sua confiança. Nossa equipe analisará sua solicitação com todo o cuidado e entrará em contato de forma discreta.
                </p>
                <Button asChild>
                  <Link to="/portal/mural">Voltar ao Mural</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="request_details" render={({ field }) => (<FormItem><FormLabel>Descreva sua necessidade</FormLabel><FormControl><Textarea placeholder="Ex: Preciso de uma cesta básica para minha família esta semana." className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <p className="text-xs text-muted-foreground">
                    Lembre-se: sua identidade será mantida em sigilo. Apenas a equipe de Ação Social terá acesso a quem fez o pedido.
                  </p>
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Enviando..." : "Enviar Pedido Confidencial"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PedirAjudaPage;