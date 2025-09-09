import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted p-6 md:py-12 w-full">
      <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
        <div className="grid gap-1">
          <h3 className="font-semibold">CBN Kerigma</h3>
          <p className="text-muted-foreground">Rua da Fé, 123, Cidade da Esperança</p>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Navegação</h3>
          <Link to="/" className="hover:underline">Início</Link>
          <Link to="/sobre" className="hover:underline">Sobre Nós</Link>
          <Link to="/contato" className="hover:underline">Contato</Link>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Recursos</h3>
          <Link to="/sermoes" className="hover:underline">Sermões</Link>
          <Link to="/eventos" className="hover:underline">Eventos</Link>
          <Link to="/doar" className="hover:underline">Doar</Link>
        </div>
        <div className="grid gap-1 col-span-2 sm:col-span-1">
          <h3 className="font-semibold">Legal</h3>
          <Link to="/privacidade" className="hover:underline">Política de Privacidade</Link>
          <Link to="/termos" className="hover:underline">Termos de Serviço</Link>
        </div>
      </div>
      <div className="container max-w-7xl mt-8 flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Comunidade Batista Nacional Kerigma. Todos os direitos reservados.
        </p>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

export default Footer;