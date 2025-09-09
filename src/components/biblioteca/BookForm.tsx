import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormValues, bookSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Book } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Search, Loader2 } from "lucide-react";

interface BookFormProps {
  onSubmit: (data: BookFormValues) => void;
  defaultValues?: Book;
  isSubmitting: boolean;
}

const BookForm = ({ onSubmit, defaultValues, isSubmitting }: BookFormProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      author: defaultValues?.author || "",
      isbn: defaultValues?.isbn || "",
      cover_url: defaultValues?.cover_url || "",
      description: defaultValues?.description || "",
      publisher: defaultValues?.publisher || "",
      published_date: defaultValues?.published_date || "",
      page_count: defaultValues?.page_count || 0,
      status: defaultValues?.status || "disponivel",
    },
  });

  const handleFetchBookData = async () => {
    const isbn = form.getValues("isbn");
    if (!isbn) {
      showError("Por favor, insira um ISBN para buscar.");
      return;
    }
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-book-details', {
        body: { isbn },
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      form.setValue("title", data.title);
      form.setValue("author", data.author);
      form.setValue("cover_url", data.cover_url);
      form.setValue("description", data.description);
      form.setValue("publisher", data.publisher);
      form.setValue("published_date", data.published_date);
      form.setValue("page_count", data.page_count);
      showSuccess("Dados do livro preenchidos!");
    } catch (err: any) {
      showError(`Erro ao buscar dados: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-end gap-2">
          <FormField control={form.control} name="isbn" render={({ field }) => (<FormItem className="flex-1"><FormLabel>ISBN</FormLabel><FormControl><Input placeholder="Código de barras do livro" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <Button type="button" onClick={handleFetchBookData} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Título do Livro" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="author" render={({ field }) => (<FormItem><FormLabel>Autor(es)</FormLabel><FormControl><Input placeholder="Nome do Autor" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="cover_url" render={({ field }) => (<FormItem><FormLabel>URL da Capa</FormLabel><FormControl><Input placeholder="https://exemplo.com/capa.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Sinopse do livro..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="publisher" render={({ field }) => (<FormItem><FormLabel>Editora</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="published_date" render={({ field }) => (<FormItem><FormLabel>Data de Publicação</FormLabel><FormControl><Input placeholder="AAAA-MM-DD" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="page_count" render={({ field }) => (<FormItem><FormLabel>Nº de Páginas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="disponivel">Disponível</SelectItem><SelectItem value="emprestado">Emprestado</SelectItem><SelectItem value="reservado">Reservado</SelectItem><SelectItem value="manutencao">Manutenção</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Livro"}</Button>
      </form>
    </Form>
  );
};

export default BookForm;