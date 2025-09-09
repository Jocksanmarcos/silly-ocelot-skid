import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { securitySettingsSchema, SecuritySettingsFormValues } from '@/lib/schemas';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/utils/toast';
import { useState } from 'react';

const SecuritySettingsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  const onSubmit = async (data: SecuritySettingsFormValues) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: data.new_password });
    if (error) {
      showError(`Erro ao alterar senha: ${error.message}`);
    } else {
      showSuccess("Senha alterada com sucesso!");
      form.reset();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Segurança</h3>
        <p className="text-sm text-muted-foreground">
          Altere sua senha e gerencie a segurança da sua conta.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
          <FormField control={form.control} name="new_password" render={({ field }) => (<FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="confirm_password" render={({ field }) => (<FormItem><FormLabel>Confirmar Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Alterar Senha"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SecuritySettingsPage;