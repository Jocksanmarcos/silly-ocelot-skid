import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarEventFormValues, calendarEventSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarEvent } from "@/types";
import { useEffect } from "react";

interface EventFormProps {
  onSubmit: (data: CalendarEventFormValues) => void;
  defaultValues?: Partial<CalendarEventFormValues>;
  isSubmitting: boolean;
}

const eventCategories = ["Culto", "Reunião", "Ensaio", "Evento Especial", "Pessoal", "Outro"];

const EventForm = ({ onSubmit, defaultValues, isSubmitting }: EventFormProps) => {
  const form = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      is_all_day: false,
      visibility: "public",
      category: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    form.reset({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      is_all_day: false,
      visibility: "public",
      category: "",
      ...defaultValues,
    });
  }, [defaultValues, form]);

  const isAllDay = form.watch("is_all_day");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título do Evento</FormLabel><FormControl><Input placeholder="Ex: Culto de Domingo" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Detalhes sobre o evento..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        
        <div className="flex items-center space-x-2">
          <FormField control={form.control} name="is_all_day" render={({ field }) => (<FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
          <Label>Dia Inteiro</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="start_time" render={({ field }) => (<FormItem><FormLabel>Início</FormLabel><FormControl><Input type={isAllDay ? "date" : "datetime-local"} {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="end_time" render={({ field }) => (<FormItem><FormLabel>Fim</FormLabel><FormControl><Input type={isAllDay ? "date" : "datetime-local"} {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="visibility" render={({ field }) => (<FormItem><FormLabel>Visibilidade</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="public">Público</SelectItem><SelectItem value="private">Privado</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger></FormControl><SelectContent>{eventCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Evento"}</Button>
      </form>
    </Form>
  );
};

export default EventForm;