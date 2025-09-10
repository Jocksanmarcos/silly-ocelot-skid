import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bibleBooks, bibleVersions } from '@/lib/bibleData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const fetchChapter = async (book: string, chapter: number, version: string) => {
  const response = await fetch(`https://bible-api.com/${book}+${chapter}?translation=${version}`);
  if (!response.ok) {
    throw new Error('Não foi possível carregar o texto.');
  }
  return response.json();
};

const BibliaPage = () => {
  const [selectedBook, setSelectedBook] = useState(bibleBooks[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState(bibleVersions[0].id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bible', selectedBook.name, selectedChapter, selectedVersion],
    queryFn: () => fetchChapter(selectedBook.name, selectedChapter, selectedVersion),
  });

  const chapterOptions = useMemo(() => {
    return Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
  }, [selectedBook]);

  const handleBookChange = (bookName: string) => {
    const newBook = bibleBooks.find(b => b.name === bookName);
    if (newBook) {
      setSelectedBook(newBook);
      setSelectedChapter(1);
    }
  };

  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(c => c - 1);
    } else {
      const currentBookIndex = bibleBooks.findIndex(b => b.name === selectedBook.name);
      if (currentBookIndex > 0) {
        const prevBook = bibleBooks[currentBookIndex - 1];
        setSelectedBook(prevBook);
        setSelectedChapter(prevBook.chapters);
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < selectedBook.chapters) {
      setSelectedChapter(c => c + 1);
    } else {
      const currentBookIndex = bibleBooks.findIndex(b => b.name === selectedBook.name);
      if (currentBookIndex < bibleBooks.length - 1) {
        const nextBook = bibleBooks[currentBookIndex + 1];
        setSelectedBook(nextBook);
        setSelectedChapter(1);
      }
    }
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Bíblia Sagrada</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Mergulhe na Palavra de Deus.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Select value={selectedBook.name} onValueChange={handleBookChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{bibleBooks.map(b => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(selectedChapter)} onValueChange={(v) => setSelectedChapter(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{chapterOptions.map(c => <SelectItem key={c} value={String(c)}>Capítulo {c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="col-span-2 md:col-span-1"><SelectValue /></SelectTrigger>
                <SelectContent>{bibleVersions.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : isError ? (
              <p className="text-destructive text-center">Erro ao carregar o capítulo. Tente outra versão ou verifique sua conexão.</p>
            ) : (
              <div>
                <CardTitle className="mb-6">{data?.reference}</CardTitle>
                <div className="space-y-4 leading-relaxed">
                  {data?.verses.map((verse: any) => (
                    <p key={verse.verse}>
                      <sup className="font-bold text-primary mr-2">{verse.verse}</sup>
                      {verse.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handlePrevChapter}><ArrowLeft className="mr-2 h-4 w-4" /> Anterior</Button>
              <Button variant="outline" onClick={handleNextChapter}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BibliaPage;