import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const fetchCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const PublicCoursesPage = () => {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["publicCourses"],
    queryFn: fetchCourses,
  });

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossos Cursos</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Invista no seu crescimento espiritual com nossas trilhas de aprendizado.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <Skeleton className="h-40 w-full" />
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-28" /></CardFooter>
              </Card>
            ))
          ) : courses && courses.length > 0 ? (
            courses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <img src={course.thumbnail_url || "/placeholder.svg"} alt={course.title} className="aspect-video w-full object-cover" />
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="line-clamp-3 text-sm text-muted-foreground">{course.description || "Veja mais detalhes sobre este curso."}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/cursos/${course.id}`}>Ver Curso</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">Nenhum curso disponível no momento.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PublicCoursesPage;