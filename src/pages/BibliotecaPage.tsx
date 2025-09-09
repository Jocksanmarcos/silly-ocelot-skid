import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types";
import { BookFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import BookForm from "@/components/biblioteca/BookForm";
import { Skeleton } from "@/components/ui/skeleton";

const fetchBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const BibliotecaPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const { data: books, isLoading } = useQuery<Book[]>({ queryKey: ["books"], queryFn: fetchBooks });

  const mutation = useMutation({
    mutationFn: async (formData: { data: BookFormValues; id?: string }) => {
      const { data, id } = formData;
      const { error } = id
        ? await supabase.from("books").update(data).eq("id", id)
        : await supabase.from("books").insert(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      showSuccess(`Livro ${selectedBook ? 'atualizado' : 'adicionado'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedBook(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      showSuccess("Livro removido com sucesso!");
      setIsAlertOpen(false);
      setSelectedBook(null);
    },
    onError: (error) => { showError(`Erro: ${error.message}`); },
  });

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setIsDialogOpen(true);
  };

  const handleDelete = (book: Book) => {
    setSelectedBook(book);
    setIsAlertOpen(true);
  };

  const handleSubmit = (data: BookFormValues) => {
    mutation.mutate({ data, id: selectedBook?.id });
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão da Biblioteca</h1>
          <p className="mt-2 text-muted-foreground">Cadastre e gerencie os livros e materiais do acervo da igreja.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedBook(null); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Livro</Button></DialogTrigger>
          <DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{selectedBook ? "Editar Livro" : "Adicionar Novo Livro"}</DialogTitle></DialogHeader><BookForm onSubmit={handleSubmit} defaultValues={selectedBook || undefined} isSubmitting={mutation.isPending} /></DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Acervo</CardTitle><CardDescription>{books?.length || 0} item(ns) cadastrado(s).</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Capa</TableHead><TableHead>Título</TableHead><TableHead>Autor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {books && books.length > 0 ? (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell><img src={book.cover_url || '/placeholder.svg'} alt={book.title} className="h-16 w-auto object-cover rounded-sm" /></TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author || 'N/A'}</TableCell>
                    <TableCell><span className={`px-2 py-1 text-xs rounded-full ${book.status === 'disponivel' ? 'bg-green-100 text-green-800' : book.status === 'emprestado' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{book.status}</span></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(book)}>Editar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(book)} className="text-red-600">Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum livro cadastrado ainda.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso removerá permanentemente o livro do acervo.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBook(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedBook && deleteMutation.mutate(selectedBook.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Removendo..." : "Remover"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BibliotecaPage;