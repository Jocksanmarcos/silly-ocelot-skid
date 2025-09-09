import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { isbn } = await req.json();
    if (!isbn) {
      return new Response(JSON.stringify({ error: "ISBN é obrigatório." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const API_KEY = Deno.env.get('GOOGLE_BOOKS_API_KEY');
    if (!API_KEY) {
      throw new Error("A chave da API do Google Books não foi configurada.");
    }

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`);
    if (!response.ok) {
      throw new Error("Falha ao buscar dados do livro.");
    }

    const data = await response.json();
    if (data.totalItems === 0 || !data.items) {
      return new Response(JSON.stringify({ error: "Nenhum livro encontrado para este ISBN." }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const book = data.items[0].volumeInfo;
    const bookData = {
      title: book.title || '',
      author: book.authors ? book.authors.join(', ') : '',
      description: book.description || '',
      publisher: book.publisher || '',
      published_date: book.publishedDate || '',
      page_count: book.pageCount || 0,
      cover_url: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || '',
    };

    return new Response(JSON.stringify(bookData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});