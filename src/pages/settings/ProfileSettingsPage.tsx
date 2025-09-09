import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Profile } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSettingsSchema, ProfileSettingsFormValues } from '@/lib/schemas';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const ProfileSettingsPage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session!.user.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profileSettings', userId],
    queryFn: () => fetchProfile(userId),
  });

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
  });

  useEffect(() => {
    if (profile) {
      form.reset({ full_name: profile.full_name || '' });
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: async (formData: ProfileSettingsFormValues) => {
      let avatarUrl = profile?.avatar_url;

      if (formData.avatar_file?.[0]) {
        const file = formData.avatar_file[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = `${publicUrl}?t=${new Date().getTime()}`; // Add timestamp to bust cache
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: formData.full_name, avatar_url: avatarUrl })
        .eq('id', userId);

      if (profileError) throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileSettings', userId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] }); // Invalidate header profile
      showSuccess("Perfil atualizado com sucesso!");
    },
    onError: (error: Error) => showError(error.message),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie as informações do seu perfil público.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <FormField
            control={form.control}
            name="avatar_file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto de Perfil</FormLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input value={session?.user.email} disabled />
          </FormItem>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileSettingsPage;