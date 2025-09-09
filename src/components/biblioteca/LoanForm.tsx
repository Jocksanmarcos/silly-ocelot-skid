import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoanFormValues, loanSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Book, Profile } from "@/types";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LoanFormProps {
  onSubmit: (data: LoanFormValues) => void;
  isSubmitting: boolean;
  books: Book[];
  profiles: Profile[];
}

const LoanForm = ({ onSubmit, isSubmitting, books, profiles }: LoanFormProps) => {
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      book_id: "",
      user_id: "",
      due_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], // Default due date: 14 days from now
    },
  });

  const availableBooks = books.filter(book => book.status === 'disponivel');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="book_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Livro</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                      {field.value ? availableBooks.find((book) => book.id === field.value)?.title : "Selecione um livro"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar livro..." />
                    <CommandList>
                      <CommandEmpty>Nenhum livro disponível encontrado.</CommandEmpty>
                      <CommandGroup>
                        {availableBooks.map((book) => (
                          <CommandItem value={book.title} key={book.id} onSelect={() => form.setValue("book_id", book.id)}>
                            <Check className={cn("mr-2 h-4 w-4", book.id === field.value ? "opacity-100" : "opacity-0")} />
                            {book.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Membro</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                      {field.value ? profiles.find((profile) => profile.id === field.value)?.full_name : "Selecione um membro"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar membro..." />
                    <CommandList>
                      <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                      <CommandGroup>
                        {profiles.map((profile) => (
                          <CommandItem value={profile.full_name || ''} key={profile.id} onSelect={() => form.setValue("user_id", profile.id)}>
                            <Check className={cn("mr-2 h-4 w-4", profile.id === field.value ? "opacity-100" : "opacity-0")} />
                            {profile.full_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Devolução</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(field.value)}
                    onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar Empréstimo"}</Button>
      </form>
    </Form>
  );
};

export default LoanForm;