import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, Lesson } from '@/types';
import { LessonFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, PlusCircle, FileType, Video } from 'lucide-react';
import LessonForm from '@/components/courses/LessonForm';

const fetchCourseAndLessons = async (courseId: string) => {
  const coursePromise = supabase.from('courses').select('*').eq('id', courseId).single();
  const lessonsPromise = supabase.from('lessons').select('*').eq('course_id', courseId).order('order', { ascending: true });
  const [{ data: course, error: courseError }, { data: lessons, error: lessonsError }] = await Promise.all([coursePromise, lessonsPromise]);
  if (courseError) throw new Error(`Erro ao buscar curso: ${courseError.message}`);
  if (lessonsError) throw new Error(`Erro ao buscar aulas: ${lessonsError.message}`);
  return { course, lessons };
};

const LessonsPage = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['course_lessons', courseId],
    queryFn: () => fetchCourseAndLessons(courseId!),
    enabled: !!courseId,
  });

  const handlePdfUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('course_materials').upload(fileName, file);
    if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);
    const { data: { publicUrl } } = supabase.storage.from('course_materials').getPublicUrl(fileName);
    return publicUrl;
  };

  const mutation = useMutation({
    mutationFn: async (formData: { data: LessonFormValues; id?: string; lessons: Lesson[] }) => {
      const { data, id, lessons } = formData;
      let contentUrl = data.content_url;

      if (data.content_type === 'pdf' && data.pdf_file) {
        contentUrl = await handlePdfUpload(data.pdf_file);
      }

      const lessonData = {
        course_id: courseId,
        title: data.title,
        content_type: data.content_type,
        content_url: contentUrl,
        order: id ? selectedLesson?.order : (lessons?.length || 0) + 1,
      };

      const { error } = id
        ? await supabase.from('lessons').update(lessonData).eq('id', id)
        : await supabase.from('lessons').insert(lessonData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_lessons', courseId] });
      showSuccess(`Aula ${selectedLesson ? 'atualizada' : 'criada'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedLesson(null);
    },
    onError: (error: Error) => showError(error.message),
  });

  if (isLoading) {
    return <div><Skeleton className="h-8 w-1/4 mb-4" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div>
      <Link to="/dashboard/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar para Cursos
      </Link>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Aulas do Curso: {data?.course?.title}</h1>
          <p className="mt-2 text-muted-foreground">Gerencie o conteúdo de cada aula.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedLesson(null); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Aula</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{selectedLesson ? 'Editar Aula' : 'Nova Aula'}</DialogTitle></DialogHeader>
            <LessonForm onSubmit={(formData) => mutation.mutate({ data: formData, id: selectedLesson?.id, lessons: data?.lessons || [] })} defaultValues={selectedLesson || undefined} isSubmitting={mutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.lessons && data.lessons.length > 0 ? (
                data.lessons.map((lesson, index) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{lesson.title}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {lesson.content_type === 'video' ? <Video className="h-4 w-4" /> : <FileType className="h-4 w-4" />}
                        {lesson.content_type.charAt(0).toUpperCase() + lesson.content_type.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedLesson(lesson); setIsDialogOpen(true); }}>Editar</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma aula encontrada. Comece adicionando uma!</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonsPage;