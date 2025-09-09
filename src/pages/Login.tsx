import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Acessar Painel de Gestão</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Endereço de e-mail',
                  password_label: 'Sua senha',
                  email_input_placeholder: 'Seu endereço de e-mail',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                    email_label: 'Endereço de e-mail',
                    password_label: 'Crie uma senha',
                    email_input_placeholder: 'Seu endereço de e-mail',
                    password_input_placeholder: 'Crie uma senha',
                    button_label: 'Registrar',
                    link_text: 'Não tem uma conta? Registre-se',
                },
                forgotten_password: {
                    email_label: 'Endereço de e-mail',
                    email_input_placeholder: 'Seu endereço de e-mail',
                    button_label: 'Enviar instruções de recuperação',
                    link_text: 'Esqueceu sua senha?',
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;