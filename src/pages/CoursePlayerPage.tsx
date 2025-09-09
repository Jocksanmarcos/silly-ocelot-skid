import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { Course, Lesson, Enrollment } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, FileText, PlayCircle } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

type CourseWithLessonsAndEnrollment = {
  course: Course & { lessons: (Lesson & { lesson_progress: { is_completed: boolean }[] })[] };
  enrollment: Enrollment | null;
};

const fetchCourseForPlayer = async (courseId: string, userId?: string): Promise<CourseWithLessonsAndEnrollment> => {
  const coursePromise = supabase.from("courses").select("*, lessons(*, lesson_progress(*))").eq("id", courseId).order('order', { referencedTable: 'lessons' }).single();
  const enrollmentPromise = userId ? supabase.from("enrollments").select("*").eq("user_id", userId).eq("course_id", courseId).single() : Promise.resolve({ data: null, error: null });
  const [{ data: course, error: courseError }, { data: enrollment, error: enrollmentError }] = await Promise.all([coursePromise, enrollmentPromise]);
  if (courseError) throw new Error(courseError.message);
  if (enrollmentError && enrollmentError.code !== 'PGRST116') throw new Error(enrollmentError.message);
  if (!enrollment) throw new Error("Acesso negado. Você não está matriculado neste curso.");
  return { course, enrollment } as CourseWithLessonsAndEnrollment;
};

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const CoursePlayerPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["course_player", courseId, session?.user?.id],
    queryFn: () => fetchCourseForPlayer(courseId!, session?.user?.id),
    enabled: !!courseId && !!session?.user?.id,
  });

  const progressMutation = useMutation({
    mutationFn: async ({ isCompleted }: { isCompleted: boolean }) => {
      if (!data?.enrollment) throw new Error("Matrícula não encontrada.");
      const { error } = await supabase.from("lesson_progress").upsert({
        enrollment_id: data.enrollment.id,
        lesson_id: lessonId!,
        is_completed: isCompleted,
      }, { onConflict: 'enrollment_id, lesson_id' });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course_player", courseId, session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["student_course_view", courseId, session?.user?.id] });
      showSuccess("Progresso salvo!");
    },
    onError: (error: Error) => showError(error.message),
  });

  if (isLoading) return <div className="container py-8 grid grid-cols-1 md:grid-cols-4 gap-8"><div className="md:col-span-3"><Skeleton className="w-full aspect-video" /></div><div className="md:col-span-1"><Skeleton className="h-96 w-full" /></div></div>;
  if (isError) return <div className="container py-12 text-center">{error.message}</div>;

  const { course, enrollment } = data!;
  const currentLesson = course.lessons.find(l => l.id === lessonId);
  const isCurrentLessonCompleted = !!currentLesson?.lesson_progress.find(p => p.is_completed);

  const handleNextLesson = () => {
    const currentIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < course.lessons.length - 1) {
      navigate(`/cursos/${courseId}/aula/${course.lessons[currentIndex + 1].id}`);
    } else {
      showSuccess("Parabéns, você concluiu o curso!");
    }
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <main className="md:col-span-3">
          <h1 className="text-2xl font-bold mb-4">{course.title} - {currentLesson?.title}</h1>
          {currentLesson?.content_type === 'video' && currentLesson.content_url && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe width="100%" height="100%" src={getYouTubeEmbedUrl(currentLesson.content_url) || ''} title={currentLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
          )}
          {currentLesson?.content_type === 'pdf' && (
            <div className="p-8 border rounded-lg flex flex-col items-center justify-center h-96 bg-muted">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">Apostila da Aula</h2>
              <Button asChild className="mt-4">
                <a href={currentLesson.content_url || '#'} target="_blank" rel="noopener noreferrer">Abrir/Baixar PDF</a>
              </Button>
            </div>
          )}
          <div className="mt-6 flex justify-between items-center">
            <Button variant="outline" onClick={() => progressMutation.mutate({ isCompleted: !isCurrentLessonCompleted })} disabled={progressMutation.isPending}>
              {isCurrentLessonCompleted ? <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Concluída</> : <><Circle className="mr-2 h-4 w-4" /> Marcar como Concluída</>}
            </Button>
            {isCurrentLessonCompleted && <Button onClick={handleNextLesson}>Próxima Aula</Button>}
          </div>
        </main>
        <aside className="md:col-span-1 border-l md:pl-6">
          <h3 className="font-bold text-lg mb-4">Aulas</h3>
          <ul className="space-y-2">
            {course.lessons.map(lesson => {
              const isCompleted = !!lesson.lesson_progress.find(p => p.is_completed);
              return (
                <li key={lesson.id}>
                  <Link to={`/cursos/${courseId}/aula/${lesson.id}`} className={`flex items-center gap-3 p-3 rounded-md transition-colors ${lesson.id === lessonId ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <PlayCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                    <span className="flex-1">{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayerPage;