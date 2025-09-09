import { useLeaderCell } from "@/hooks/useLeaderCell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const LeaderPortalLink = () => {
  const { isLeader, isLoading } = useLeaderCell();

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!isLeader) {
    return null;
  }

  return (
    <Card className="col-span-full bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Home /> Portal do Líder</CardTitle>
        <CardDescription>Você foi designado como líder de célula. Acesse seu painel para gerenciar seu grupo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/leader/dashboard">Acessar meu painel</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeaderPortalLink;