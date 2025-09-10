import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sermon } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const fetchSermons = async (): Promise<Sermon[]> => {
  const { data, error } = await supabase
    .from("sermons")
    .select("*, profiles(full_name)")
    .order("sermon_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const getYouTubeThumbnail = (url: string) => {
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const PublicSermonsPage = () => {
  const { data: sermons, isLoading } = useQuery({
    queryKey: ["publicSermons"],
    queryFn: fetchSermons,
  });

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossas Mensagens</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Acesse nossa biblioteca de sermões e seja edificado pela Palavra de Deus a qualquer momento.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-64" />)
          ) : sermons && sermons.length > 0 ? (
            sermons.map((sermon) => (
              <Link to={sermon.video_url || '#'} key={sermon.id} target="_blank" rel="noopener noreferrer">
                <Card className="overflow-hidden h-full flex flex-col group">
                  <CardHeader className="p-0 relative">
                    <img src={sermon.thumbnail_url || getYouTubeThumbnail(sermon.video_url || '')} alt={sermon.title} className="aspect-video w-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold">{sermon.title}</h3>
                    <p className="text-sm text-muted-foreground">{(sermon.profiles as any)?.full_name || 'Pregador(a)'}</p>
                    <div className="flex-1" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{new Date(sermon.sermon_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">Nenhum sermão encontrado.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PublicSermonsPage;