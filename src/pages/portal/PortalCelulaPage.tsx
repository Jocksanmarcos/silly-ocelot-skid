import { Link } from "react-router-dom";
import { ArrowLeft, Users, Clock, MapPin, User, Home } from "lucide-react";
import { useMemberCell } from "@/hooks/useMemberCell";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const PortalCelulaPage = () => {
  const { data: cell, isLoading } = useMemberCell();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Link to="/portal" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar para o Painel
      </Link>
      <h1 className="text-3xl font-bold">Minha Célula</h1>

      {cell ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{cell.name}</CardTitle>
            <CardDescription>{cell.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Líder</p>
                  <p className="text-muted-foreground">{cell.leader?.full_name || 'Não definido'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Encontros</p>
                  <p className="text-muted-foreground">{cell.meeting_day} às {cell.meeting_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Local</p>
                  <p className="text-muted-foreground">{cell.address || cell.location_type}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> Membros do Grupo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {cell.members.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profiles?.avatar_url || undefined} />
                      <AvatarFallback>{member.profiles?.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{member.profiles?.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6 text-center py-12">
          <CardContent>
            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Você ainda não faz parte de uma célula</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              As células são o coração da nossa comunidade. Encontre um grupo para se conectar!
            </p>
            <Button asChild className="mt-4">
              <Link to="/celulas">Encontrar uma Célula</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortalCelulaPage;