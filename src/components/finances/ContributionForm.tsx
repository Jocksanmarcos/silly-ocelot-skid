import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContributionFormValues, contributionSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Member, Contribution } from "@/types";
import { useEffect } from "react";

interface ContributionFormProps {
  onSubmit: (data: ContributionFormValues) => void;
  defaultValues?: Contribution;
  isSubmitting: boolean;
  members: Member[];
}

const funds = ["Dízimo", "Oferta", "Missões", "Oferta Especial", "Outro"];
const paymentMethods = ["PIX", "Cartão de Crédito/Débito", "Dinheiro", "Transferência Bancária"];

const ContributionForm = ({ onSubmit, defaultValues, isSubmitting, members }: ContributionFormProps) => {
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      contributor_type: defaultValues?.member_id ? "member" : "anonymous",
      member_id: defaultValues?.member_id || "",
      contributor_name: defaultValues?.contributor_name || "",
      amount: defaultValues?.amount || 0,
      contribution_date: defaultValues?.contribution_date ? new Date(defaultValues.contribution_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      fund: defaultValues?.fund || "",
      payment_method: defaultValues?.payment_method || "",
      notes: defaultValues?.notes || "",
    },
  });

  const contributorType = form.watch("contributor_type");

  useEffect(() => {
    if (contributorType === 'member') {
      form.setValue('contributor_name', '');
    } else {
      form.setValue('member_id', '');
    }
  }, [contributorType, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="contributor_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Contribuinte</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="member" /></FormControl><FormLabel className="font-normal">Membro</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="anonymous" /></FormControl><FormLabel className="font-normal">Anônimo / Visitante</FormLabel></FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {contributorType === 'member' ? (
          <FormField
            control={form.control}
            name="member_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membro</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione um membro" /></SelectTrigger></FormControl>
                  <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{`${m.first_name} ${m.last_name}`}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="contributor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Contribuinte</FormLabel>
                <FormControl><Input placeholder="Nome do contribuinte" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="contribution_date" render={({ field }) => (<FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="fund" render={({ field }) => (<FormItem><FormLabel>Fundo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o fundo de destino" /></SelectTrigger></FormControl><SelectContent>{funds.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="payment_method" render={({ field }) => (<FormItem><FormLabel>Método de Pagamento</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o método" /></SelectTrigger></FormControl><SelectContent>{paymentMethods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Anotações</FormLabel><FormControl><Textarea placeholder="Alguma observação?" {...field} /></FormControl><FormMessage /></FormItem>)} />
        
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Contribuição"}</Button>
      </form>
    </Form>
  );
};

export default ContributionForm;