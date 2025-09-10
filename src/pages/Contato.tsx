import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react";

const Contato = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="space-y-4 text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Entre em Contato</h1>
          <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
            Adoraríamos ouvir de você. Envie-nos uma mensagem ou visite-nos.
          </p>
        </div>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Informações de Contato</h2>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p>Estrada de Ribamar, Km 2, Nº 5 - Aurora</p>
                  <p className="text-sm text-muted-foreground">(em frente do Centro do Pop da Prefeitura)</p>
                  <p className="text-sm text-muted-foreground">São Luís - Maranhão</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <p>(11) 1234-5678</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <p>contato@cbnkerigma.com</p>
              </div>
            </div>
            {/* Placeholder for a map */}
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Mapa aqui</p>
            </div>
          </div>
          <div className="space-y-4">
              <h2 className="text-2xl font-bold">Envie uma Mensagem</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Seu email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input id="subject" placeholder="Assunto da mensagem" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea id="message" placeholder="Sua mensagem" className="min-h-[100px]" />
              </div>
              <Button type="submit">Enviar Mensagem</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contato;