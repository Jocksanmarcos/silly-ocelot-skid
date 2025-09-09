import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, GraduationCap, Users, User } from "lucide-react";

const navItems = [
  { href: "/portal", icon: LayoutDashboard, label: "Painel" },
  { href: "/portal/cursos", icon: GraduationCap, label: "Cursos" },
  { href: "/portal/celula", icon: Users, label: "Célula" },
  { href: "/portal/perfil", icon: User, label: "Perfil" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t h-16 md:hidden">
      <nav className="grid h-full grid-cols-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
              location.pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;