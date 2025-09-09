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

interface RegistrationFormProps {
  event: Event;
  onFinished: () => void;
}

const RegistrationForm = ({ event, onFinished }: RegistrationFormProps) => {
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { full_name: "", email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegistrationFormValues) => {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        full_name: data.full_name,
        email: data.email,
        status: 'confirmed', // For now, only free events are handled
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

  const onSubmit = (data: RegistrationFormValues) => {
    mutation.mutate(data);
  };

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
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Confirmando..." : "Confirmar Inscrição"}
        </Button>
      </form>
    </Form>
  );
};

export default RegistrationForm;