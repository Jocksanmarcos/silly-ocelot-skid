import { useAuth } from "@/contexts/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const PortalIndex = () => {
  const { session } = useAuth();
  const fullName = session?.user?.user_metadata?.full_name || session?.user?.email;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Olá, {fullName}!</h1>
        <p className="text-muted-foreground">Que bom ter você aqui. Este é o seu espaço na comunidade.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Meus Cursos
            </CardTitle>
            <CardDescription>Continue sua jornada de aprendizado.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aqui você verá os cursos em que está inscrito.
            </p>
            <Link to="/portal/cursos" className="text-sm font-semibold text-primary mt-4 block">
              Ver todos os cursos &rarr;
            </Link>
          </CardContent>
        </Card>
        {/* Outros cards (Minha Célula, etc.) serão adicionados aqui no futuro */}
      </div>
    </div>
  );
};

export default PortalIndex;