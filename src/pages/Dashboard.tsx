import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel de Gestão</h1>
        <Button onClick={handleLogout}>
          Sair
        </Button>
      </div>
      <p className="mt-4">
        Bem-vindo, <span className="font-semibold">{session?.user?.email}</span>!
      </p>
      <div className="mt-8 p-6 border rounded-lg bg-muted">
        <p className="text-muted-foreground">Esta é a área administrativa. Em breve, adicionaremos funcionalidades como gestão de membros, eventos e finanças.</p>
      </div>
    </div>
  );
};

export default Dashboard;