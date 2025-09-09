import { Church, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

const Header = () => {
  const { session } = useAuth();

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/sobre", label: "Sobre Nós" },
    { href: "/celulas", label: "Células" },
    { href: "/eventos", label: "Eventos" },
    { href: "/cursos", label: "Cursos" },
    { href: "/agenda", label: "Agenda" },
    { href: "/aconselhamento", label: "Aconselhamento" },
    { href: "/contato", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Church className="h-6 w-6" />
            <span className="font-bold sm:inline-block">
              CBN Kerigma
            </span>
          </Link>
        </div>
        <nav className="hidden flex-1 items-center space-x-4 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {session ? (
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/dashboard">Painel</Link>
            </Button>
          ) : (
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/login">Login</Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;