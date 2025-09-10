import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberFormValues, memberSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Member, Family, Congregation } from "@/types";

interface MemberFormProps {
  onSubmit: (data: MemberFormValues) => void;
  defaultValues?: Member;
  isSubmitting: boolean;
  families: Family[];
  congregations: Congregation[];
  isSuperAdmin: boolean;
  userCongregationId?: string;
}

const maritalStatuses = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "Outro"];
const familyRoles = ["Pai/Responsável", "Mãe", "Cônjuge", "Filho(a)", "Outro"];

const MemberForm = ({ onSubmit, defaultValues, isSubmitting, families, congregations, isSuperAdmin, userCongregationId }: MemberFormProps) => {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      membership_date: defaultValues?.membership_date ? new Date(defaultValues.membership_date).toISOString().split('T')[0] : "",
      date_of_birth: defaultValues?.date_of_birth ? new Date(defaultValues.date_of_birth).toISOString().split('T')[0] : "",
      family_id: defaultValues?.family_id || "",
      marital_status: defaultValues?.marital_status || "",
      family_role: defaultValues?.family_role || "",
      congregation_id: defaultValues?.congregation_id || (isSuperAdmin ? "" : userCongregationId),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome do membro" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input placeholder="Sobrenome do membro" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField
          control={form.control}
          name="congregation_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Missão/Sede</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isSuperAdmin}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a Missão/Sede" /></SelectTrigger></FormControl>
                <SelectContent>{congregations.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input placeholder="Rua, número, bairro..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="membership_date" render={({ field }) => (<FormItem><FormLabel>Data de Admissão</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="date_of_birth" render={({ field }) => (<FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="marital_status" render={({ field }) => (<FormItem><FormLabel>Estado Civil</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent>{maritalStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="family_role" render={({ field }) => (<FormItem><FormLabel>Vínculo Familiar</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent>{familyRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <FormField
            control={form.control}
            name="family_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Família</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Associe a uma família" /></SelectTrigger></FormControl>
                  <SelectContent>{families.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
};

export default MemberForm;