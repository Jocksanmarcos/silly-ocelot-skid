const images = [
    { src: "https://images.unsplash.com/photo-1513152697235-6278b1530ab6?q=80&w=2070&auto=format&fit=crop", alt: "Evento da comunidade" },
    { src: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop", alt: "Voluntários em ação" },
    { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop", alt: "Grupo de estudo bíblico" },
    { src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop", alt: "Jovens da igreja" },
    { src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2070&auto=format&fit=crop", alt: "Culto de domingo" },
    { src: "https://images.unsplash.com/photo-1580457183924-895786937043?q=80&w=2070&auto=format&fit=crop", alt: "Crianças no ministério infantil" },
];

const Galeria = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossos Momentos</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Reviva os momentos especiais que compartilhamos como comunidade.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="overflow-hidden rounded-lg">
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover aspect-video transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Galeria;