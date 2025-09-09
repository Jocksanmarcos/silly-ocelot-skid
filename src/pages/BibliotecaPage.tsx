import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, BookOpen } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fetchBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const BibliotecaPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão da Biblioteca</h1>
          <p className="mt-2 text-muted-foreground">
            Cadastre e gerencie os livros e materiais do acervo da igreja.
          </p>
        </div>
        <Button onClick={() => { setSelectedBook(null); setIsDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Livro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acervo</CardTitle>
          <CardDescription>
            {books?.length || 0} item(ns) cadastrado(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capa</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books && books.length > 0 ? (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <img src={book.cover_url || '/placeholder.svg'} alt={book.title} className="h-16 w-auto object-cover rounded-sm" />
                    </TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        book.status === 'disponivel' ? 'bg-green-100 text-green-800' :
                        book.status === 'emprestado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {book.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum livro cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* O Dialog para adicionar/editar será implementado na próxima fase */}
    </div>
  );
};

export default BibliotecaPage;