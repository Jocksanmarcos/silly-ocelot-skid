import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const events = [
  {
    title: "Conferência de Casais",
    date: "15 de Agosto, 2024",
    description: "Um final de semana para fortalecer os laços matrimoniais com palestras e dinâmicas.",
  },
  {
    title: "Acampamento de Jovens",
    date: "05 a 07 de Setembro, 2024",
    description: "Três dias de muita diversão, louvor e aprendizado da Palavra de Deus para a juventude.",
  },
  {
    title: "Musical de Natal",
    date: "22 de Dezembro, 2024",
    description: "Uma celebração especial do nascimento de Jesus com música e teatro.",
  },
];

const Eventos = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Próximos Eventos</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Fique por dentro de tudo o que acontece na nossa comunidade. Participe!
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {events.map((event, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </CardHeader>
              <CardContent>
                <p>{event.description}</p>
              </CardContent>
              <CardFooter>
                <Button>Saiba Mais</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Eventos;