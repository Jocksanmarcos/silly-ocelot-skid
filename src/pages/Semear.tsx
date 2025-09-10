import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Landmark, Building } from "lucide-react";
import PixQRCode from "@/components/PixQRCode";

const Semear = () => {
  const pixCnpj = "10.472.815/0001-27";

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Semear & Transformar</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Sua generosidade impulsiona a missão e transforma vidas.
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Por que Contribuir?</h2>
            <p className="text-muted-foreground mt-2">
              Cada dízimo e oferta que recebemos é investido para alcançar mais pessoas com a mensagem de Jesus,
              apoiar nossa comunidade local e sustentar os ministérios da nossa igreja. Agradecemos sua
              fidelidade e coração generoso.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><QrCode /> PIX</CardTitle>
                <CardDescription>Rápido e seguro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <PixQRCode 
                  pixKey={pixCnpj}
                  merchantName="CBN Kerigma"
                  merchantCity="BRASILIA"
                />
                <p className="text-sm text-center"><strong>Chave:</strong> {pixCnpj} (CNPJ)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Landmark /> Transferência</CardTitle>
                <CardDescription>Depósito ou TED</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Banco:</strong> Banco Exemplo (001)</p>
                <p><strong>Agência:</strong> 1234</p>
                <p><strong>Conta Corrente:</strong> 56789-0</p>
                <p><strong>CNPJ:</strong> {pixCnpj}</p>
                <p><strong>Favorecido:</strong> CBN Kerigma</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building /> Presencialmente</CardTitle>
                <CardDescription>Em nossos cultos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Você pode entregar seu dízimo ou oferta durante nossos cultos de celebração.</p>
                <p className="font-semibold mt-4">Estrada de Ribamar, Km 2, Nº 5 - Aurora</p>
                <p className="text-xs">(em frente do Centro do Pop da Prefeitura)</p>
                <p>São Luís - Maranhão</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Semear;