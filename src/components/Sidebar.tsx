import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users, Calendar, DollarSign, LayoutDashboard, LogOut, Home, Network, HeartHandshake, GraduationCap, Handshake, TrendingUp, Archive, BookOpen, Settings, Music, LayoutTemplate } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/dashboard/agenda", icon: Calendar, label: "Agenda" },
  { href: "/dashboard/events", icon: Calendar, label: "Eventos" },
  { href: "/dashboard/louvor", icon: Music, label: "Louvor" },
];

const communityNavItems = [
  { href: "/dashboard/members", icon: Users, label: "Pessoas" },
  { href: "/dashboard/families", icon: HeartHandshake, label: "Famílias" },
  { href: "/dashboard/cells", icon: Home, label: "Células" },
  { href: "/dashboard/visitors", icon: Handshake, label: "Recepção" },
  { href: "/dashboard/journey", icon: TrendingUp, label: "Jornada" },
  { href: "/dashboard/hierarchy", icon: Network, label: "Hierarquia" },
];

const resourcesNavItems = [
  { href: "/dashboard/courses", icon: GraduationCap, label: "Ensino" },
  { href: "/dashboard/voluntariado", icon: Handshake, label: "Voluntariado" },
  { href: "/dashboard/aconselhamento", icon: HeartHandshake, label: "Aconselhamento" },
  { href: "/dashboard/generosidade", icon: HeartHandshake, label: "Generosidade" },
  { href: "/dashboard/biblioteca", icon: BookOpen, label: "Biblioteca" },
];

const adminNavItems = [
  { href: "/dashboard/finances", icon: DollarSign, label: "Finanças" },
  { href: "/dashboard/patrimonio", icon: Archive, label: "Patrimônio" },
];

const bottomNavItems = [
    { href: "/editor", icon: LayoutTemplate, label: "Editor de Site" },
    { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const renderLink = (item: typeof mainNavItems[0]) => (
    <Link
      key={item.href}
      to={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary ${
        location.pathname.startsWith(item.href) && (item.href !== '/dashboard' || location.pathname === '/dashboard')
          ? "bg-muted text-primary"
          : "text-muted-foreground"
      }`}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  );

  const renderSection = (title: string, items: typeof mainNavItems) => (
    <div>
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">{title}</h3>
        {items.map(renderLink)}
    </div>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r">
      <div className="p-4 border-b h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-light.png" alt="CBN Kerigma Logo" className="h-8 block dark:hidden" />
          <img src="/logo-dark.png" alt="CBN Kerigma Logo" className="h-8 hidden dark:block" />
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {renderSection("Geral", mainNavItems)}
        {renderSection("Comunidade", communityNavItems)}
        {renderSection("Recursos", resourcesNavItems)}
        {renderSection("Administração", adminNavItems)}
      </nav>
      <div className="p-4 border-t">
        <nav className="space-y-1">
            {bottomNavItems.map(renderLink)}
        </nav>
        <Button variant="ghost" className="w-full justify-start mt-2 text-muted-foreground hover:text-primary" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;