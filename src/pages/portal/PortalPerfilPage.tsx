import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Profile, Member } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type ProfileData = {
  profile: Profile | null;
  member: Member | null;
};

const profileSchema = z.object({
  full_name: z.string().min(3, "O nome completo é obrigatório."),
  email: z.string().email("Email inválido."),
  phone: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const fetchProfileData = async (userId: string): Promise<ProfileData> => {
  const profilePromise = supabase.from('profiles').select('*').eq('id', userId).single();
  const memberPromise = supabase.from('members').select('*').eq('user_id', userId).single();

  const [{ data: profile }, { data: member }] = await Promise.all([profilePromise, memberPromise]);

  return { profile, member };
};

const PortalPerfilPage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session!.user.id;

  const { data, isLoading } = useQuery({
    queryKey: ['userProfileData', userId],
    queryFn: () => fetchProfileData(userId),
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      email: session?.user.email || '',
      phone: '',
      address: '',
      date_of_birth: '',
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        full_name: data.profile?.full_name || '',
        email: data.member?.email || session?.user.email || '',
        phone: data.member?.phone || '',
        address: data.member?.address || '',
        date_of_birth: data.member?.date_of_birth ? new Date(data.member.date_of_birth).toISOString().split('T')[0] : '',
      });
    }
  }, [data, form, session]);

  const mutation = useMutation({
    mutationFn: async (formData: ProfileFormValues) => {
      const { full_name, ...memberData } = formData;

      const profileUpdatePromise = supabase
        .from('profiles')
        .update({ full_name, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      const memberUpdatePromise = supabase
        .from('members')
        .update(memberData)
        .eq('user_id', userId);

      const [{ error: profileError }, { error: memberError }] = await Promise.all([profileUpdatePromise, memberUpdatePromise]);

      if (profileError) throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
      if (memberError && memberError.code !== 'PGRST116') throw new Error(`Erro ao atualizar dados de membro: ${memberError.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData', userId] });
      showSuccess("Perfil atualizado com sucesso!");
    },
    onError: (error: Error) => showError(error.message),
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Link to="/portal" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar para o Painel
      </Link>
      <h1 className="text-3xl font-bold">Meu Perfil</h1>
      <p className="text-muted-foreground mt-2">Mantenha suas informações de contato sempre atualizadas.</p>

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Essas informações nos ajudam a manter contato e a cuidar melhor de você.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" disabled {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input placeholder="Seu endereço" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="date_of_birth" render={({ field }) => (<FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalPerfilPage;