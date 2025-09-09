import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FamilyFormValues, familySchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Family, Member } from "@/types";

interface FamilyFormProps {
  onSubmit: (data: FamilyFormValues) => void;
  defaultValues?: Family;
  isSubmitting: boolean;
  members: Member[];
}

const FamilyForm = ({ onSubmit, defaultValues, isSubmitting, members }: FamilyFormProps) => {
  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      head_of_family_id: defaultValues?.head_of_family_id || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Família</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Família Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="head_of_family_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável pela Família</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro como responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {`${member.first_name} ${member.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Família"}
        </Button>
      </form>
    </Form>
  );
};

export default FamilyForm;