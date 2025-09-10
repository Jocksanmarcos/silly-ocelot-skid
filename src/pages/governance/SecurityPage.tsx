import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { securitySettingsSchema, SecuritySettingsFormValues } from '@/lib/schemas';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/utils/toast';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { QRCodeCanvas } from 'qrcode.react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const SecurityPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mfa, setMfa] = useState<{ qrCode?: string, factorId?: string, isEnabled: boolean }>({ isEnabled: false });
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const checkMfaStatus = async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      setMfa({ isEnabled: (data?.factors.length || 0) > 0 });
    };
    checkMfaStatus();
  }, []);

  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  const handleEnableMfa = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) return showError(`Erro ao habilitar MFA: ${error.message}`);
    setMfa({ qrCode: data.totp.qr_code, factorId: data.id, isEnabled: false });
  };

  const handleVerifyMfa = async () => {
    if (!mfa.factorId) return;
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfa.factorId, code: verificationCode });
    if (error) return showError(`Código inválido: ${error.message}`);
    showSuccess("MFA habilitado com sucesso!");
    setMfa({ isEnabled: true });
  };

  const handleDisableMfa = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    if (!data?.factors[0]) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: data.factors[0].id });
    if (error) return showError(`Erro ao desabilitar MFA: ${error.message}`);
    showSuccess("MFA desabilitado com sucesso.");
    setMfa({ isEnabled: false });
  };

  const handleSignOutOthers = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    if (error) return showError(`Erro: ${error.message}`);
    showSuccess("Desconectado de todos os outros dispositivos.");
  };

  const onPasswordSubmit = async (data: SecuritySettingsFormValues) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: data.new_password });
    if (error) showError(`Erro ao alterar senha: ${error.message}`);
    else { showSuccess("Senha alterada com sucesso!"); form.reset(); }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Autenticação de Múltiplos Fatores (MFA)</h3>
        <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta.</p>
        <div className="mt-4">
          {mfa.isEnabled ? (
            <Button variant="destructive" onClick={handleDisableMfa}>Desabilitar MFA</Button>
          ) : mfa.qrCode ? (
            <div className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Passo 1: Escaneie o QR Code</AlertTitle>
                <AlertDescription>Use um aplicativo como Google Authenticator ou Authy para escanear a imagem abaixo.</AlertDescription>
              </Alert>
              <div className="p-4 bg-white rounded-md w-fit"><QRCodeCanvas value={mfa.qrCode} size={200} /></div>
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Passo 2: Insira o código de verificação</Label>
                <div className="flex gap-2">
                  <Input id="mfa-code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Código de 6 dígitos" />
                  <Button onClick={handleVerifyMfa}>Verificar e Ativar</Button>
                </div>
              </div>
            </div>
          ) : (
            <Button onClick={handleEnableMfa}>Habilitar MFA</Button>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Gerenciamento de Sessões</h3>
        <p className="text-sm text-muted-foreground">Desconecte sua conta de outros dispositivos.</p>
        <Button variant="outline" className="mt-4" onClick={handleSignOutOthers}>Desconectar de todos os outros dispositivos</Button>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Alterar Senha</h3>
        <p className="text-sm text-muted-foreground">Escolha uma senha forte e segura.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-sm mt-4">
            <FormField control={form.control} name="new_password" render={({ field }) => (<FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="confirm_password" render={({ field }) => (<FormItem><FormLabel>Confirmar Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Alterar Senha"}</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SecurityPage;