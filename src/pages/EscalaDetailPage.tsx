import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorshipEvent, Song, WorshipMember, Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, PlusCircle, Trash2, Bell } from 'lucide-react';

type ScaleDetailData = {
  scale: WorshipEvent & {
    worship_teams: WorshipTeam & {
      worship_members: (WorshipMember & { profiles: Profile })[];
    };
    worship_event_songs: { songs: Song }[];
    worship_event_members: { member_id: string, status: string }[];
  };
  allSongs: Song[];
};

const fetchScaleDetails = async (scaleId: string): Promise<ScaleDetailData> => {
  const scalePromise = supabase
    .from('worship_events')
    .select(`*, worship_teams(*, worship_members(*, profiles(*))), worship_event_songs(*, songs(*)), worship_event_members(*)`)
    .eq('id', scaleId)
    .single();
  const songsPromise = supabase.from('songs').select('*').order('title');
  const [{ data: scale, error: scaleError }, { data: allSongs, error: songsError }] = await Promise.all([scalePromise, songsPromise]);
  if (scaleError || songsError) throw new Error(scaleError?.message || songsError?.message);
  return { scale, allSongs } as any;
};

const EscalaDetailPage = () => {
  const { id: scaleId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [openSongPopover, setOpenSongPopover] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['scaleDetails', scaleId],
    queryFn: () => fetchScaleDetails(scaleId!),
    enabled: !!scaleId,
  });

  const songMutation = useMutation({
    mutationFn: async ({ songId, action }: { songId: string, action: 'add' | 'remove' }) => {
      if (action === 'add') {
        const { error } = await supabase.from('worship_event_songs').insert({ event_id: scaleId, song_id: songId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('worship_event_songs').delete().match({ event_id: scaleId, song_id: songId });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['scaleDetails', scaleId] }); showSuccess("Repertório atualizado!"); },
    onError: (error: Error) => showError(error.message),
  });

  const memberMutation = useMutation({
    mutationFn: async ({ memberId, isSelected }: { memberId: string, isSelected: boolean }) => {
      if (isSelected) {
        const { error } = await supabase.from('worship_event_members').insert({ event_id: scaleId, member_id: memberId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('worship_event_members').delete().match({ event_id: scaleId, member_id: memberId });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['scaleDetails', scaleId] }); showSuccess("Equipe atualizada!"); },
    onError: (error: Error) => showError(error.message),
  });

  if (isLoading) return <div><Skeleton className="h-96 w-full" /></div>;

  const { scale, allSongs } = data!;
  const scaleSongIds = new Set(scale.worship_event_songs.map(s => s.songs.id));
  const scaleMemberIds = new Set(scale.worship_event_members.map(m => m.member_id));

  return (
    <div className="space-y-6">
      <Link to="/dashboard/louvor/escalas" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar para Escalas
      </Link>
      <div>
        <h1 className="text-3xl font-bold">{scale.title}</h1>
        <p className="text-muted-foreground">{new Date(scale.event_date).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' })}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex-row justify-between items-center">
            <CardTitle>Repertório</CardTitle>
            <Popover open={openSongPopover} onOpenChange={setOpenSongPopover}>
              <PopoverTrigger asChild><Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Música</Button></PopoverTrigger>
              <PopoverContent className="p-0"><Command><CommandInput placeholder="Buscar música..." /><CommandList><CommandEmpty>Nenhuma música encontrada.</CommandEmpty><CommandGroup>
                {allSongs.filter(s => !scaleSongIds.has(s.id)).map(song => (
                  <CommandItem key={song.id} onSelect={() => { songMutation.mutate({ songId: song.id, action: 'add' }); setOpenSongPopover(false); }}>{song.title}</CommandItem>
                ))}
              </CommandGroup></CommandList></Command></PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Música</TableHead><TableHead>Artista</TableHead><TableHead>Tom</TableHead><TableHead className="text-right"></TableHead></TableRow></TableHeader>
              <TableBody>
                {scale.worship_event_songs.map(({ songs: song }) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell>{song.artist}</TableCell>
                    <TableCell>{song.song_key}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => songMutation.mutate({ songId: song.id, action: 'remove' })}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Equipe Convocada</CardTitle>
            <CardDescription>{scale.worship_teams?.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {scale.worship_teams?.worship_members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div>
                  <p className="text-sm font-medium">{member.profiles.full_name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <Checkbox checked={scaleMemberIds.has(member.id)} onCheckedChange={(checked) => memberMutation.mutate({ memberId: member.id, isSelected: !!checked })} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EscalaDetailPage;