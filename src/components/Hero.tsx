import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?q=80&w=2070&auto=format&fit=crop')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 container px-4 md:px-6 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
          Encontre o seu Lugar
        </h1>
        <p className="max-w-[700px] mx-auto text-lg text-gray-200 md:text-xl">
          Uma igreja onde cada pessoa é valorizada e encontra sua família em Cristo
        </p>
        <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
          <Button asChild size="lg">
            <Link to="/contato">Planeje Sua Visita</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/celulas">Encontrar uma Célula</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;