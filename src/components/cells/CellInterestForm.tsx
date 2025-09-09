import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CellInterestFormValues, cellInterestSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface CellInterestFormProps {
  cellId: string;
  onFinished: () => void;
}

const CellInterestForm = ({ cellId, onFinished }: CellInterestFormProps) => {
  const form = useForm<CellInterestFormValues>({
    resolver: zodResolver(cellInterestSchema),
    defaultValues: { full_name: "", email: "", phone: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: CellInterestFormValues) => {
      const { error } = await supabase.from("cell_members").insert({
        cell_id: cellId,
        ...data,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      showSuccess("Interesse registrado! O líder da célula entrará em contato em breve.");
      onFinished();
    },
    onError: (error) => {
      showError(`Erro ao registrar interesse: ${error.message}`);
    },
  });

  const onSubmit = (data: CellInterestFormValues) => {
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
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (WhatsApp)</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Enviando..." : "Enviar Interesse"}
        </Button>
      </form>
    </Form>
  );
};

export default CellInterestForm;