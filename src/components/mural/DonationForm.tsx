import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DonationFormValues, donationSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DonationFormProps {
  onSubmit: (data: DonationFormValues) => void;
  isSubmitting: boolean;
}

const categories: DonationFormValues['category'][] = ['Móveis', 'Roupas', 'Eletrodomésticos', 'Alimentos', 'Livros', 'Brinquedos', 'Outros'];

const DonationForm = ({ onSubmit, isSubmitting }: DonationFormProps) => {
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Outros",
      images: null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>O que você está doando?</FormLabel><FormControl><Input placeholder="Ex: Sofá de 3 lugares em bom estado" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Detalhes sobre o item, condições, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fotos do Item</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" multiple onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Publicando..." : "Publicar Doação"}
        </Button>
      </form>
    </Form>
  );
};

export default DonationForm;