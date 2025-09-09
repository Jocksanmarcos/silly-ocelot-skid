import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CounselingRequestFormValues, counselingRequestSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { CheckCircle, ShieldCheck } from 'lucide-react';

const AconselhamentoPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<CounselingRequestFormValues>({
    resolver: zodResolver(counselingRequestSchema),
    defaultValues: {
      requester_name: "",
      requester_contact_email: "",
      requester_contact_phone: "",
      preferred_contact_method: "Telefone",
      reason_summary: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CounselingRequestFormValues) => {
      const { error } = await supabase.from("counseling_requests").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      showSuccess("Sua solicitação foi enviada com sucesso.");
      setIsSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      showError(`Erro ao enviar: ${error.message}`);
    },
  });

  const onSubmit = (data: CounselingRequestFormValues) => {
    mutation.mutate(data);
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Pedido de Aconselhamento</CardTitle>
            <CardDescription className="text-muted-foreground">
              Um espaço seguro e confidencial para você. Preencha o formulário abaixo e nossa equipe pastoral entrará em contato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center space-y-4 py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-semibold">Recebemos sua solicitação!</h3>
                <p className="text-muted-foreground">
                  Agradecemos por sua confiança. Um de nossos pastores entrará em contato com você em breve, de forma discreta, através do meio que você indicou.
                </p>
                <Button onClick={() => setIsSubmitted(false)}>Fazer Nova Solicitação</Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="requester_name" render={({ field }) => (<FormItem><FormLabel>Seu Nome</FormLabel><FormControl><Input placeholder="Como podemos chamar você?" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="requester_contact_email" render={({ field }) => (<FormItem><FormLabel>Seu Email</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="requester_contact_phone" render={({ field }) => (<FormItem><FormLabel>Seu Telefone (WhatsApp)</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="preferred_contact_method" render={({ field }) => (<FormItem><FormLabel>Como prefere o contato?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Telefone" /></FormControl><FormLabel className="font-normal">Telefone</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Email" /></FormControl><FormLabel className="font-normal">Email</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="reason_summary" render={({ field }) => (<FormItem><FormLabel>Assunto (Opcional)</FormLabel><FormControl><Textarea placeholder="Se sentir à vontade, descreva brevemente o motivo do seu contato. Esta informação é confidencial." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Enviando..." : "Enviar Solicitação Confidencial"}
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

export default AconselhamentoPage;