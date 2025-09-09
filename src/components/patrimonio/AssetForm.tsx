import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssetFormValues, assetSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset, AssetCategory, AssetLocation, Profile } from "@/types";

interface AssetFormProps {
  onSubmit: (data: AssetFormValues) => void;
  defaultValues?: Asset;
  isSubmitting: boolean;
  categories: AssetCategory[];
  locations: AssetLocation[];
  profiles: Profile[];
}

const statuses = ["Em uso", "Em manutenção", "Disponível", "Baixado", "Descarte"];

const AssetForm = ({ onSubmit, defaultValues, isSubmitting, categories, locations, profiles }: AssetFormProps) => {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      category_id: defaultValues?.category_id || null,
      location_id: defaultValues?.location_id || null,
      purchase_date: defaultValues?.purchase_date ? new Date(defaultValues.purchase_date).toISOString().split('T')[0] : null,
      purchase_price: defaultValues?.purchase_price || null,
      current_value: defaultValues?.current_value || null,
      status: defaultValues?.status || "Em uso",
      serial_number: defaultValues?.serial_number || null,
      assigned_to: defaultValues?.assigned_to || null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome do Item</FormLabel><FormControl><Input placeholder="Ex: Cadeira de Plástico Branca" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Detalhes adicionais sobre o item..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="category_id" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="location_id" render={({ field }) => (<FormItem><FormLabel>Localização</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a localização" /></SelectTrigger></FormControl><SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="purchase_date" render={({ field }) => (<FormItem><FormLabel>Data da Compra</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="purchase_price" render={({ field }) => (<FormItem><FormLabel>Valor de Compra (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="current_value" render={({ field }) => (<FormItem><FormLabel>Valor Atual (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="serial_number" render={({ field }) => (<FormItem><FormLabel>Nº de Série / Código</FormLabel><FormControl><Input placeholder="Código de identificação" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="assigned_to" render={({ field }) => (<FormItem><FormLabel>Responsável</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um responsável" /></SelectTrigger></FormControl><SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Item"}</Button>
      </form>
    </Form>
  );
};

export default AssetForm;