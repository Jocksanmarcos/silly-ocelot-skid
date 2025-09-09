import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import BirthdaysWidget from "@/components/members/BirthdaysWidget";
import MemberGrowthChart from "@/components/members/MemberGrowthChart";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase.from("members").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const MembersDashboardPage = () => {
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-80 md:col-span-1" />
          <Skeleton className="h-80 md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard/members" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Lista de Pessoas
        </Link>
        <h1 className="text-3xl font-bold">Painel de Pessoas</h1>
        <p className="mt-2 text-muted-foreground">
          Insights e estatísticas sobre as pessoas da comunidade.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <BirthdaysWidget members={members || []} />
        </div>
        <div className="md:col-span-2">
          <MemberGrowthChart members={members || []} />
        </div>
      </div>
    </div>
  );
};

export default MembersDashboardPage;