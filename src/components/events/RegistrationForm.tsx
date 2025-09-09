import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegistrationFormValues, registrationSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Event } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

initMercadoPago(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY);

interface RegistrationFormProps {
  event: Event;
  onFinished: () => void;
}

const RegistrationForm = ({ event, onFinished }: RegistrationFormProps) => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const isFree = !event.price || event.price === 0;

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { full_name: "", email: "" },
  });

  const freeRegistrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormValues) => {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        full_name: data.full_name,
        email: data.email,
        status: 'confirmed',
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      showSuccess("Inscrição realizada com sucesso!");
      onFinished();
    },
    onError: (error) => {
      showError(`Erro na inscrição: ${error.message}`);
    },
  });

  const createPaymentPreference = async (data: RegistrationFormValues) => {
    setIsProcessing(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('create-payment', {
        body: {
          event: {
            event_id: event.id,
            title: event.title,
            price: event.price,
          },
          userDetails: {
            full_name: data.full_name,
            email: data.email,
          },
        },
      });

      if (error) throw error;
      if (response.preferenceId) {
        setPreferenceId(response.preferenceId);
      } else {
        throw new Error(response.error || "Não foi possível gerar o pagamento.");
      }
    } catch (error: any) {
      showError(`Erro ao iniciar pagamento: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = (data: RegistrationFormValues) => {
    if (isFree) {
      freeRegistrationMutation.mutate(data);
    } else {
      createPaymentPreference(data);
    }
  };

  const onPaymentReady = () => {
    console.log("Componente de pagamento pronto.");
  };

  const onPaymentSubmit = async ({ formData }: any) => {
    // O backend (webhook) irá confirmar o pagamento, aqui apenas notificamos o usuário.
    console.log("Pagamento submetido:", formData);
  };

  const onPaymentError = async (error: any) => {
    console.error("Erro no pagamento:", error);
    showError("Ocorreu um erro ao processar seu pagamento.");
  };

  if (preferenceId) {
    return (
      <div>
        <Alert className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Quase lá!</AlertTitle>
          <AlertDescription>
            Complete o pagamento abaixo para confirmar sua inscrição.
          </AlertDescription>
        </Alert>
        <Payment
          initialization={{ preferenceId: preferenceId }}
          onReady={onPaymentReady}
          onSubmit={onPaymentSubmit}
          onError={onPaymentError}
        />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={freeRegistrationMutation.isPending || isProcessing}>
          {isProcessing ? "Processando..." : (isFree ? "Confirmar Inscrição" : "Continuar para Pagamento")}
        </Button>
      </form>
    </Form>
  );
};

export default RegistrationForm;