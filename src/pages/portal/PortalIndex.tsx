import { useAuth } from "@/contexts/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemberCell } from "@/hooks/useMemberCell";
import { Skeleton } from "@/components/ui/skeleton";

const PortalIndex = () => {
  const { session } = useAuth();
  const { data: cell, isLoading: isLoadingCell } = useMemberCell();
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
              Acesse os cursos em que você está inscrito.
            </p>
            <Link to="/portal/cursos" className="text-sm font-semibold text-primary mt-4 block">
              Ver todos os cursos &rarr;
            </Link>
          </CardContent>
        </Card>
        
        {isLoadingCell ? (
            <Skeleton className="h-full w-full rounded-lg" />
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Minha Célula
                    </CardTitle>
                    <CardDescription>Acompanhe seu pequeno grupo.</CardDescription>
                </CardHeader>
                <CardContent>
                    {cell ? (
                        <div>
                            <p className="font-semibold">{cell.name}</p>
                            <p className="text-sm text-muted-foreground">Líder: {cell.leader?.full_name}</p>
                            <Link to="/portal/celula" className="text-sm font-semibold text-primary mt-4 block">
                                Ver detalhes da célula &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Você ainda não está em uma célula.
                            </p>
                            <Link to="/celulas" className="text-sm font-semibold text-primary mt-4 block">
                                Encontrar uma célula &rarr;
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
};

export default PortalIndex;