import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Bem-vindo à Comunidade Batista Nacional Kerigma
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                Um lugar para pertencer, crer e crescer. Junte-se a nós para adorar e servir.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Button asChild size="lg">
                <Link to="/visite">Visite-nos</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/sermoes">Sermões Online</Link>
              </Button>
            </div>
          </div>
          <img
            src="/placeholder.svg"
            alt="Igreja"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;