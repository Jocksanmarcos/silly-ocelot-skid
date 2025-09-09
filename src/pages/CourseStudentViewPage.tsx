import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Course, Enrollment } from "@/types";
import { useAuth } from "@/contexts/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, PlayCircle } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const fetchCourseData = async (courseId: string, userId?: string) => {
  const coursePromise = supabase.from("courses").select("*, lessons(*, lesson_progress(is_completed))").eq("id", courseId).order('order', { referencedTable: 'lessons' }).single();
  const enrollmentPromise = userId ? supabase.from("enrollments").select("*").eq("user_id", userId).eq("course_id", courseId).single() : Promise.resolve({ data: null, error: null });

  const [{ data: course, error: courseError }, { data: enrollment, error: enrollmentError }] = await Promise.all([coursePromise, enrollmentPromise]);

  if (courseError) throw new Error(courseError.message);
  if (enrollmentError && enrollmentError.code !== 'PGRST116') throw new Error(enrollmentError.message); // Ignore 'not found' error

  return { course, enrollment };
};

const CourseStudentViewPage = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student_course_view", courseId, session?.user?.id],
    queryFn: () => fetchCourseData(courseId!, session?.user?.id),
    enabled: !!courseId,
  });

  const enrollmentMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Você precisa estar logado para se inscrever.");
      const { error } = await supabase.from("enrollments").insert({ user_id: session.user.id, course_id: courseId! });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student_course_view", courseId, session?.user?.id] });
      showSuccess("Matrícula realizada com sucesso!");
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleEnroll = () => {
    if (!session) {
      navigate('/login');
    } else {
      enrollmentMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-24 w-full" /></div>
        <div><Skeleton className="h-96 w-full" /></div>
      </div>
    );
  }

  if (isError || !data?.course) {
    return <div className="container py-12 text-center">Curso não encontrado.</div>;
  }

  const { course, enrollment } = data;
  const isEnrolled = !!enrollment;

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <img src={course.thumbnail_url || "/placeholder.svg"} alt={course.title} className="w-full h-auto aspect-video object-cover rounded-lg border" />
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">{course.title}</h1>
            <p className="text-muted-foreground">{course.description || "Nenhuma descrição fornecida."}</p>
          </div>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aulas do Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {course.lessons?.map((lesson, index) => (
                  <li key={lesson.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      {isEnrolled ? <PlayCircle className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                      <span>{index + 1}. {lesson.title}</span>
                    </span>
                  </li>
                ))}
                {(!course.lessons || course.lessons.length === 0) && <p className="text-sm text-muted-foreground">Nenhuma aula cadastrada ainda.</p>}
              </ul>
            </CardContent>
          </Card>
          {!isEnrolled && (
            <Button size="lg" className="w-full" onClick={handleEnroll} disabled={enrollmentMutation.isPending}>
              {enrollmentMutation.isPending ? "Inscrevendo..." : "Inscrever-se no Curso"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseStudentViewPage;