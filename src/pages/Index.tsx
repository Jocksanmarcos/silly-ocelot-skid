import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceTimes from "@/components/ServiceTimes";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <ServiceTimes />
      </main>
      <Footer />
    </div>
  );
};

export default Index;