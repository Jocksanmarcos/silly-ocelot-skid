import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { Profile } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type ProfileWithScore = Pick<Profile, 'id' | 'full_name' | 'avatar_url'> & { generosity_score: number };

const fetchRanking = async (): Promise<ProfileWithScore[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, generosity_score')
    .order('generosity_score', { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return data;
};

const fetchMyScore = async (userId: string): Promise<ProfileWithScore | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, generosity_score')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
};

const HallDaGenerosidadePage = () => {
  const { session } = useAuth();
  const { data: ranking, isLoading: isLoadingRanking } = useQuery({
    queryKey: ['generosityRanking'],
    queryFn: fetchRanking,
  });
  const { data: myProfile, isLoading: isLoadingMyScore } = useQuery({
    queryKey: ['myGenerosityScore', session?.user.id],
    queryFn: () => fetchMyScore(session!.user.id),
    enabled: !!session,
  });

  const getTrophyColor = (index: number) => {
    if (index === 0) return "text-yellow-500";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-yellow-700";
    return "text-muted-foreground";
  };

  return (
    <div className="container py-12">
      <Link to="/mural-da-generosidade" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar para o Mural
      </Link>
      <div className="flex flex-col items-center text-center mb-12">
        <Trophy className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tighter">Hall da Fama da Generosidade</h1>
        <p className="max-w-2xl text-muted-foreground mt-2">
          Celebramos e agradecemos a todos que abençoam nossa comunidade com suas doações.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ranking da Generosidade</CardTitle>
              <CardDescription>Os 10 membros que mais contribuíram.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {isLoadingRanking ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />) :
                 ranking?.map((profile, index) => (
                  <li key={profile.id} className="flex items-center gap-4">
                    <Trophy className={`h-6 w-6 ${getTrophyColor(index)}`} />
                    <Avatar>
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>{profile.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium">{profile.full_name}</span>
                    <span className="font-bold text-lg">{profile.generosity_score} pts</span>
                  </li>
                 ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" /> Minha Pontuação</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              {isLoadingMyScore ? <Skeleton className="h-24 w-full" /> : (
                <>
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={myProfile?.avatar_url || undefined} />
                    <AvatarFallback className="text-3xl">{myProfile?.full_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <p className="text-3xl font-bold">{myProfile?.generosity_score || 0} <span className="text-lg font-normal">pontos</span></p>
                  <p className="text-muted-foreground">{myProfile?.full_name}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HallDaGenerosidadePage;