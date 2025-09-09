import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaintenanceFormValues, maintenanceSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MaintenanceFormProps {
  onSubmit: (data: MaintenanceFormValues) => void;
  isSubmitting: boolean;
}

const MaintenanceForm = ({ onSubmit, isSubmitting }: MaintenanceFormProps) => {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      maintenance_date: new Date().toISOString().split('T')[0],
      description: "",
      cost: 0,
      provider: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="maintenance_date" render={({ field }) => (<FormItem><FormLabel>Data da Manutenção</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição do Serviço</FormLabel><FormControl><Textarea placeholder="Descreva o que foi feito..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Custo (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="provider" render={({ field }) => (<FormItem><FormLabel>Fornecedor / Prestador</FormLabel><FormControl><Input placeholder="Nome da empresa ou pessoa" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Registro"}
        </Button>
      </form>
    </Form>
  );
};

export default MaintenanceForm;