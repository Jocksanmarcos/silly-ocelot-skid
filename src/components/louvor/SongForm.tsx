import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SongFormValues, songSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Song } from "@/types";

interface SongFormProps {
  onSubmit: (data: SongFormValues) => void;
  defaultValues?: Song;
  isSubmitting: boolean;
}

const SongForm = ({ onSubmit, defaultValues, isSubmitting }: SongFormProps) => {
  const form = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      artist: defaultValues?.artist || "",
      song_key: defaultValues?.song_key || "",
      bpm: defaultValues?.bpm || undefined,
      lyrics_chords: defaultValues?.lyrics_chords || "",
      youtube_url: defaultValues?.youtube_url || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título da Música</FormLabel><FormControl><Input placeholder="Ex: Grande é o Senhor" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="artist" render={({ field }) => (<FormItem><FormLabel>Artista / Compositor</FormLabel><FormControl><Input placeholder="Ex: Adhemar de Campos" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="song_key" render={({ field }) => (<FormItem><FormLabel>Tom</FormLabel><FormControl><Input placeholder="Ex: G" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="bpm" render={({ field }) => (<FormItem><FormLabel>BPM</FormLabel><FormControl><Input type="number" placeholder="Ex: 120" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="youtube_url" render={({ field }) => (<FormItem><FormLabel>Link do YouTube</FormLabel><FormControl><Input placeholder="Cole o link do vídeo aqui" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="lyrics_chords" render={({ field }) => (<FormItem><FormLabel>Cifra / Letra</FormLabel><FormControl><Textarea placeholder="Cole a cifra completa ou a letra da música aqui..." className="min-h-[250px] font-mono" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Música"}
        </Button>
      </form>
    </Form>
  );
};

export default SongForm;