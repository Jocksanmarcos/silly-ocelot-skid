import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScaleFormValues, scaleSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorshipTeam } from "@/types";

interface ScaleFormProps {
  onSubmit: (data: ScaleFormValues) => void;
  isSubmitting: boolean;
  teams: WorshipTeam[];
}

const ScaleForm = ({ onSubmit, isSubmitting, teams }: ScaleFormProps) => {
  const form = useForm<ScaleFormValues>({
    resolver: zodResolver(scaleSchema),
    defaultValues: {
      title: "",
      event_date: "",
      team_id: "",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título do Evento/Culto</FormLabel><FormControl><Input placeholder="Ex: Culto de Domingo - Manhã" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="event_date" render={({ field }) => (<FormItem><FormLabel>Data e Hora</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="team_id" render={({ field }) => (<FormItem><FormLabel>Equipe</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a equipe" /></SelectTrigger></FormControl><SelectContent>{teams.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea placeholder="Alguma observação para a equipe?" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Escala"}
        </Button>
      </form>
    </Form>
  );
};

export default ScaleForm;