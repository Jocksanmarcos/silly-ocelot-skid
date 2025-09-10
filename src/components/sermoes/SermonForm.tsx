import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SermonFormValues, sermonSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Profile } from "@/types";

interface SermonFormProps {
  onSubmit: (data: SermonFormValues) => void;
  defaultValues?: Partial<SermonFormValues>;
  isSubmitting: boolean;
  preachers: Profile[];
}

const SermonForm = ({ onSubmit, defaultValues, isSubmitting, preachers }: SermonFormProps) => {
  const form = useForm<SermonFormValues>({
    resolver: zodResolver(sermonSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      preacher_id: defaultValues?.preacher_id || "",
      sermon_date: defaultValues?.sermon_date ? new Date(defaultValues.sermon_date).toISOString().split('T')[0] : "",
      video_url: defaultValues?.video_url || "",
      description: defaultValues?.description || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título do Sermão</FormLabel><FormControl><Input placeholder="Ex: O Amor Incondicional" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="preacher_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pregador(a)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o pregador" /></SelectTrigger></FormControl>
                  <SelectContent>{preachers.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="sermon_date" render={({ field }) => (<FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="video_url" render={({ field }) => (<FormItem><FormLabel>Link do Vídeo (YouTube, Vimeo)</FormLabel><FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição / Resumo</FormLabel><FormControl><Textarea placeholder="Descreva os principais pontos da mensagem..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Sermão"}
        </Button>
      </form>
    </Form>
  );
};

export default SermonForm;