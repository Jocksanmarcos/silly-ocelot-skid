import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { Course, Enrollment } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Este tipo combina dados do curso com os da matrícula
type EnrolledCourse = Course & {
  enrollments: Pick<Enrollment, 'status' | 'completed_at'>[];
};

const fetchEnrolledCourses = async (userId: string): Promise<EnrolledCourse[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      enrollments!inner(status, completed_at)
    `)
    .eq('enrollments.user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
  return data as EnrolledCourse[];
};


const PortalCursosPage = () => {
  const { session } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['enrolledCourses', session?.user?.id],
    queryFn: () => fetchEnrolledCourses(session!.user.id),
    enabled: !!session?.user?.id,
  });

  return (
    <div className="p-4 md:p-8">
       <Link to="/portal" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Painel
        </Link>
      <h1 className="text-3xl font-bold">Meus Cursos</h1>
      <p className="text-muted-foreground mt-2">
        Aqui estão todos os cursos em que você está matriculado. Continue sua jornada de aprendizado!
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="h-40 w-full" />
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-10 w-full" /></CardContent>
            </Card>
          ))
        ) : courses && courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <img src={course.thumbnail_url || "/placeholder.svg"} alt={course.title} className="aspect-video w-full object-cover rounded-t-lg" />
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/cursos/${course.id}`}>
                    {course.enrollments[0]?.status === 'completed' ? "Revisar Curso" : "Acessar Curso"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Você ainda não está matriculado em nenhum curso.</p>
            <Button asChild variant="link" className="mt-2">
              <Link to="/cursos">Ver cursos disponíveis</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalCursosPage;