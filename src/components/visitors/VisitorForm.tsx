import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisitorFormValues, visitorSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Visitor } from "@/types";

interface VisitorFormProps {
  onSubmit: (data: VisitorFormValues) => void;
  defaultValues?: Visitor;
  isSubmitting: boolean;
}

const VisitorForm = ({ onSubmit, defaultValues, isSubmitting }: VisitorFormProps) => {
  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      full_name: defaultValues?.full_name || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      address: defaultValues?.address || "",
      invited_by: defaultValues?.invited_by || "",
      visit_status: defaultValues?.visit_status || "Primeira vez",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Nome completo do visitante" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone/WhatsApp</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email (Opcional)</FormLabel><FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Endereço (Bairro/Cidade)</FormLabel><FormControl><Input placeholder="Ex: Centro, Cidade da Esperança" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="invited_by" render={({ field }) => (<FormItem><FormLabel>Quem Convidou?</FormLabel><FormControl><Input placeholder="Nome de quem fez o convite" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField
          control={form.control}
          name="visit_status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Esta é a...</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Primeira vez" /></FormControl><FormLabel className="font-normal">Primeira vez</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Retorno" /></FormControl><FormLabel className="font-normal">Retorno</FormLabel></FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Visitante"}</Button>
      </form>
    </Form>
  );
};

export default VisitorForm;