import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { showSuccess } from "@/utils/toast";

const fetchBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const PublicBibliotecaPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["publicBooks"],
    queryFn: fetchBooks,
  });

  const filteredBooks = books?.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: Book['status']) => {
    switch (status) {
      case 'disponivel': return 'default';
      case 'emprestado': return 'destructive';
      case 'reservado': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossa Biblioteca</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Explore nosso acervo de livros e enriqueça sua jornada de fé e conhecimento.
          </p>
          <div className="w-full max-w-md">
            <Input 
              placeholder="Buscar por título ou autor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index}>
                <Skeleton className="h-48 w-full" />
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))
          ) : filteredBooks && filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <Card key={book.id} className="flex flex-col">
                <CardHeader className="p-0 items-center">
                  <img src={book.cover_url || "/placeholder.svg"} alt={book.title} className="aspect-[2/3] w-full object-cover rounded-t-lg" />
                </CardHeader>
                <div className="flex flex-col flex-1 p-4">
                  <CardTitle className="text-base font-semibold line-clamp-2">{book.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                  <div className="flex-1" />
                  <div className="flex justify-between items-center mt-4">
                    <Badge variant={getStatusVariant(book.status)}>{book.status}</Badge>
                    <Button 
                      size="sm" 
                      disabled={book.status !== 'disponivel'}
                      onClick={() => showSuccess(`Reserva para "${book.title}" solicitada!`)}
                    >
                      Reservar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">Nenhum livro encontrado.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PublicBibliotecaPage;