import { Cross, Users, BookOpen, HeartHandshake, Megaphone, Hand } from "lucide-react";

const Sobre = () => {
  const valores = [
    {
      icon: <Cross className="h-8 w-8 text-primary" />,
      title: "Adoração Centrada em Cristo",
      description: "Tudo o que fazemos é para a glória de Deus, com Jesus no centro.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Comunhão Genuína",
      description: "Somos uma família que se apoia, celebra e caminha junta.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Ensino Bíblico Sólido",
      description: "A Palavra de Deus é nossa base para a vida e a fé.",
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-primary" />,
      title: "Serviço com Amor",
      description: "Servimos uns aos outros e à nossa cidade com alegria e compaixão.",
    },
    {
      icon: <Megaphone className="h-8 w-8 text-primary" />,
      title: "Evangelismo Relevante",
      description: "Compartilhamos as boas novas de Jesus de forma criativa e autêntica.",
    },
    {
      icon: <Hand className="h-8 w-8 text-primary" />,
      title: "Oração Contínua",
      description: "Acreditamos no poder da oração para mover o coração de Deus.",
    },
  ];

  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Nossa História e Missão
              </h1>
              <p className="text-muted-foreground md:text-xl/relaxed">
                A Comunidade Batista Nacional Kerigma nasceu do desejo de criar um espaço de adoração, comunhão e serviço, fundamentado na Palavra de Deus. Nossa jornada começou há mais de 20 anos, com um pequeno grupo de famílias reunidas em uma sala de estar, e hoje somos uma comunidade vibrante que busca impactar nossa cidade com o amor de Cristo.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1507692049790-de5866163e64?q=80&w=1974&auto=format&fit=crop"
                alt="Nossa Igreja"
                className="aspect-video overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Nossos Valores</h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
              Estes são os pilares que sustentam nossa comunidade e guiam nossas ações.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
            {valores.map((valor) => (
              <div key={valor.title} className="grid gap-2 text-center">
                <div className="flex justify-center">{valor.icon}</div>
                <h3 className="text-lg font-bold">{valor.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {valor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Sobre;