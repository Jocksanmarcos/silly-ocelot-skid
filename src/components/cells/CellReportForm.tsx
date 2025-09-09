import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CellReportFormValues, cellReportSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CellReportFormProps {
  onSubmit: (data: CellReportFormValues) => void;
  isSubmitting: boolean;
}

const CellReportForm = ({ onSubmit, isSubmitting }: CellReportFormProps) => {
  const form = useForm<CellReportFormValues>({
    resolver: zodResolver(cellReportSchema),
    defaultValues: {
      meeting_date: new Date().toISOString().split('T')[0],
      attendance_count: 0,
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="meeting_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Encontro</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attendance_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nº de Presentes</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anotações</FormLabel>
              <FormControl>
                <Textarea placeholder="O que foi discutido? Há algum pedido de oração?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Relatório"}
        </Button>
      </form>
    </Form>
  );
};

export default CellReportForm;