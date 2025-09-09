import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song, WorshipTeam, WorshipMember, Profile } from "@/types";
import { SongFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { PlusCircle, Music, Users, Calendar, Trash2 } from "lucide-react";
import SongForm from "@/components/louvor/SongForm";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fetchLouvorData = async () => {
  const songsPromise = supabase.from("songs").select("*").order("title");
  const teamsPromise = supabase.from("worship_teams").select("*, worship_members(*, profiles(full_name))").order("name");
  const profilesPromise = supabase.from("profiles").select("id, full_name").order("full_name");
  
  const [
    { data: songs, error: songsError }, 
    { data: teams, error: teamsError },
    { data: profiles, error: profilesError }
  ] = await Promise.all([songsPromise, teamsPromise, profilesPromise]);

  if (songsError || teamsError || profilesError) throw new Error(songsError?.message || teamsError?.message || profilesError?.message);
  return { songs, teams, profiles };
};

const LouvorPage = () => {
  const queryClient = useQueryClient();
  const [isSongDialogOpen, setIsSongDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newMember, setNewMember] = useState({ profileId: '', teamId: '', role: '' });

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

  const teamMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("worship_teams").insert({ name });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["louvorData"] });
      showSuccess("Equipe criada com sucesso!");
      setIsTeamDialogOpen(false);
      setNewTeamName("");
    },
    onError: (error: Error) => showError(error.message),
  });

  const memberMutation = useMutation({
    mutationFn: async (memberData: { user_id: string; team_id: string; role: string }) => {
      const { error } = await supabase.from("worship_members").insert(memberData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["louvorData"] });
      showSuccess("Membro adicionado à equipe!");
      setNewMember({ profileId: '', teamId: '', role: '' });
    },
    onError: (error: Error) => showError(error.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("worship_members").delete().eq("id", memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["louvorData"] });
      showSuccess("Membro removido da equipe.");
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleAddMember = () => {
    if (!newMember.profileId || !newMember.teamId || !newMember.role) {
      showError("Por favor, preencha todos os campos.");
      return;
    }
    memberMutation.mutate({ user_id: newMember.profileId, team_id: newMember.teamId, role: newMember.role });
  };

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
            <TabsTrigger value="equipes"><Users className="mr-2 h-4 w-4" /> Equipes e Membros</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild><Link to="/dashboard/louvor/escalas"><Calendar className="mr-2 h-4 w-4" /> Gerenciar Escalas</Link></Button>
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
          <Card>
            <CardHeader className="flex-row justify-between items-center">
              <CardTitle>Adicionar Membro a uma Equipe</CardTitle>
              <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                <DialogTrigger asChild><Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Nova Equipe</Button></DialogTrigger>
                <DialogContent className="sm:max-w-xs"><DialogHeader><DialogTitle>Criar Nova Equipe</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="team-name">Nome da Equipe</Label>
                    <Input id="team-name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
                  </div>
                  <Button onClick={() => teamMutation.mutate(newTeamName)} disabled={teamMutation.isPending}>Salvar</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="flex items-end gap-2">
              <div className="flex-1"><label className="text-sm font-medium">Membro</label><Select onValueChange={(value) => setNewMember(p => ({...p, profileId: value}))}><SelectTrigger><SelectValue placeholder="Selecione um membro" /></SelectTrigger><SelectContent>{data?.profiles?.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex-1"><label className="text-sm font-medium">Equipe</label><Select onValueChange={(value) => setNewMember(p => ({...p, teamId: value}))}><SelectTrigger><SelectValue placeholder="Selecione a equipe" /></SelectTrigger><SelectContent>{data?.teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex-1"><label className="text-sm font-medium">Função</label><Input placeholder="Ex: Vocal, Violão" onChange={(e) => setNewMember(p => ({...p, role: e.target.value}))} /></div>
              <Button onClick={handleAddMember} disabled={memberMutation.isPending}>Adicionar</Button>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            {isLoading ? <><Skeleton className="h-64" /><Skeleton className="h-64" /></> :
             data?.teams?.map(team => (
              <Card key={team.id}>
                <CardHeader><CardTitle>{team.name}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(team.worship_members as any[])?.map(member => (
                      <li key={member.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p>{member.profiles.full_name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMemberMutation.mutate(member.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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