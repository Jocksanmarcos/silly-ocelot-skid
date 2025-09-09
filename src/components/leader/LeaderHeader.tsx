import { Link, useNavigate } from "react-router-dom";
import { Church, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";

const LeaderHeader = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link to="/leader/dashboard" className="flex items-center space-x-2">
            <Church className="h-6 w-6" />
            <span className="inline-block font-bold">Portal do Líder</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {session?.user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sair</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default LeaderHeader;