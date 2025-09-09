import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PortalCursosPage = () => {
  return (
    <div className="p-4 md:p-8">
       <Link to="/portal" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Painel
        </Link>
      <h1 className="text-3xl font-bold">Meus Cursos</h1>
      <p className="text-muted-foreground mt-2">
        Em breve, você verá aqui todos os cursos em que está matriculado.
      </p>
    </div>
  );
};

export default PortalCursosPage;