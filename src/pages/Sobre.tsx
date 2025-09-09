import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Sobre = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
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
                  src="/placeholder.svg"
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
              <div className="grid gap-1 text-center">
                <h3 className="text-lg font-bold">Adoração</h3>
                <p className="text-sm text-muted-foreground">
                  Buscamos glorificar a Deus em tudo o que fazemos.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <h3 className="text-lg font-bold">Comunhão</h3>
                <p className="text-sm text-muted-foreground">
                  Crescemos juntos como uma família em Cristo.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <h3 className="text-lg font-bold">Serviço</h3>
                <p className="text-sm text-muted-foreground">
                  Servimos uns aos outros e à nossa comunidade com amor.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sobre;