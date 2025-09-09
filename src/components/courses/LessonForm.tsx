import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LessonFormValues, lessonSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lesson } from "@/types";

interface LessonFormProps {
  onSubmit: (data: LessonFormValues) => void;
  defaultValues?: Partial<Lesson>;
  isSubmitting: boolean;
}

const LessonForm = ({ onSubmit, defaultValues, isSubmitting }: LessonFormProps) => {
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      content_type: defaultValues?.content_type || "video",
      content_url: defaultValues?.content_url || "",
    },
  });

  const contentType = form.watch("content_type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Aula</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Introdução ao Curso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Conteúdo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="pdf">Apostila (PDF)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {contentType === 'video' && (
          <FormField
            control={form.control}
            name="content_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Vídeo (YouTube, Vimeo)</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {contentType === 'pdf' && (
          <FormField
            control={form.control}
            name="pdf_file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arquivo PDF</FormLabel>
                <FormControl>
                  <Input type="file" accept=".pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                </FormControl>
                {defaultValues?.content_url && !field.value && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Um arquivo já existe. Envie um novo para substituí-lo.
                    </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Aula"}
        </Button>
      </form>
    </Form>
  );
};

export default LessonForm;