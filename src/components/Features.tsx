import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, BookOpen, Users, Calendar } from "lucide-react";

const features = [
  {
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Comunidade Acolhedora",
    description: "Uma família que se importa e caminha junto com você.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: "Crescimento Espiritual",
    description: "Recursos e estudos para fortalecer sua fé.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Células Conectadas",
    description: "Pequenos grupos para relacionamentos genuínos.",
  },
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: "Eventos Especiais",
    description: "Momentos únicos de celebração e aprendizado.",
  },
];

const Features = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">O que você encontrará aqui</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Nossa igreja é um lugar onde você pode crescer, se conectar e fazer a diferença.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col items-center text-center p-6">
              <CardHeader className="p-0">
                {feature.icon}
              </CardHeader>
              <CardContent className="p-0 mt-4 flex-1">
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;