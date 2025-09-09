import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";

const ServiceTimes = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossos Cultos</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Convidamos você e sua família para se juntarem a nós em adoração e comunhão.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Culto de Domingo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Manhã: 09:00 | Noite: 18:00</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Estudo Bíblico
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Quartas-feiras: 19:30</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reunião de Oração
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Sextas-feiras: 06:00</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServiceTimes;