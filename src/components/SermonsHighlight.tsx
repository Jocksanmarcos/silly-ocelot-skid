import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const sermons = [
  {
    title: "O Amor que Transforma",
    preacher: "Pastor João Silva",
    date: "14/01/2024",
    duration: "35 min",
    thumbnail: "/placeholder.svg",
    link: "#",
  },
  {
    title: "Fé em Tempos Difíceis",
    preacher: "Pastora Maria Santos",
    date: "07/01/2024",
    duration: "42 min",
    thumbnail: "/placeholder.svg",
    link: "#",
  },
  {
    title: "Propósito e Chamado",
    preacher: "Pastor Carlos Lima",
    date: "31/12/2023",
    duration: "38 min",
    thumbnail: "/placeholder.svg",
    link: "#",
  },
];

const SermonsHighlight = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Mensagens que Inspiram</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Acesse nossa biblioteca de sermões e seja edificado pela Palavra de Deus.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {sermons.map((sermon) => (
            <Link to={sermon.link} key={sermon.title}>
              <Card className="overflow-hidden h-full flex flex-col group">
                <CardHeader className="p-0 relative">
                  <img src={sermon.thumbnail} alt={sermon.title} className="aspect-video w-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-white/80 group-hover:scale-110 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold">{sermon.title}</h3>
                  <p className="text-sm text-muted-foreground">{sermon.preacher}</p>
                  <div className="flex-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{sermon.date}</span>
                    <span>{sermon.duration}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SermonsHighlight;