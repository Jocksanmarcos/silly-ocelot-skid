import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song, WorshipTeam, WorshipMember } from "@/types";
import { SongFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { PlusCircle, Music, Users, Calendar } from "lucide-react";
import SongForm from "@/components/louvor/SongForm";
import { Link } from "react-router-dom";

const fetchLouvorData = async () => {
  const songsPromise = supabase.from("songs").select("*").order("title");
  const teamsPromise = supabase.from("worship_teams").select("*, worship_members(*, profiles(full_name))");
  
  const [{ data: songs, error: songsError }, { data: teams, error: teamsError }] = await Promise.all([songsPromise, teamsPromise]);

  if (songsError || teamsError) throw new Error(songsError?.message || teamsError?.message);
  return { songs, teams };
};

const LouvorPage = () => {
  const queryClient = useQueryClient();
  const [isSongDialogOpen, setIsSongDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["louvorData"],
    queryFn: fetchLouvorData,
  });

  const songMutation = useMutation({
    mutationFn: async (formData: { data: SongFormValues; id?: string }) => {
      const { data, id } = formData;
      const { error } = id
        ? await supabase.from("songs").update(data).eq("id", id)
        : await supabase.from("songs").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["louvorData"] });
      showSuccess(`Música ${selectedSong ? 'atualizada' : 'adicionada'} com sucesso!`);
      setIsSongDialogOpen(false);
      setSelectedSong(null);
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleEditSong = (song: Song) => {
    setSelectedSong(song);
    setIsSongDialogOpen(true);
  };

  const handleSongSubmit = (data: SongFormValues) => {
    songMutation.mutate({ data, id: selectedSong?.id });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Central de Louvor</h1>
        <p className="mt-2 text-muted-foreground">Gerencie o repertório, equipes e escalas do ministério de louvor.</p>
      </div>

      <Tabs defaultValue="repertorio">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="repertorio"><Music className="mr-2 h-4 w-4" /> Repertório</TabsTrigger>
            <TabsTrigger value="equipes"><Users className="mr-2 h-4 w-4" /> Equipes</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard/louvor/escalas">
                <Calendar className="mr-2 h-4 w-4" />
                Gerenciar Escalas
              </Link>
            </Button>
            <Dialog open={isSongDialogOpen} onOpenChange={(open) => { setIsSongDialogOpen(open); if (!open) setSelectedSong(null); }}>
              <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Música</Button></DialogTrigger>
              <DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{selectedSong ? "Editar Música" : "Adicionar ao Repertório"}</DialogTitle></DialogHeader><SongForm onSubmit={handleSongSubmit} defaultValues={selectedSong || undefined} isSubmitting={songMutation.isPending} /></DialogContent>
            </Dialog>
          </div>
        </div>
        <TabsContent value="repertorio">
          <Card>
            <CardHeader><CardTitle>Repertório</CardTitle><CardDescription>{data?.songs?.length || 0} música(s) cadastradas.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Artista</TableHead><TableHead>Tom</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-24 w-full" /></TableCell></TableRow> :
                   data?.songs?.map(song => (
                    <TableRow key={song.id}>
                      <TableCell className="font-medium">{song.title}</TableCell>
                      <TableCell>{song.artist}</TableCell>
                      <TableCell>{song.song_key}</TableCell>
                      <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleEditSong(song)}>Ver / Editar</Button></TableCell>
                    </TableRow>
                   ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="equipes">
          <div className="grid gap-6 md:grid-cols-2">
            {isLoading ? <><Skeleton className="h-64" /><Skeleton className="h-64" /></> :
             data?.teams?.map(team => (
              <Card key={team.id}>
                <CardHeader><CardTitle>{team.name}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(team.worship_members as any[])?.map(member => (
                      <li key={member.id} className="flex justify-between text-sm">
                        <span>{member.profiles.full_name}</span>
                        <span className="text-muted-foreground">{member.role}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
             ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LouvorPage;