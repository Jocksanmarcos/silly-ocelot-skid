import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users, Calendar, DollarSign, LayoutDashboard, LogOut, Home, Network, HeartHandshake, GraduationCap, Handshake, TrendingUp, Archive, BookOpen, Settings, Music, LayoutTemplate, Building } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "./ui/skeleton";

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
  { href: "/dashboard/congregations", icon: Building, label: "Missões/Sedes" },
];

const bottomNavItems = [
    { href: "/editor", icon: LayoutTemplate, label: "Editor de Site" },
    { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const userRole = profile?.role;
  const isSuperAdmin = userRole === 'super_admin';
  const isAdmin = isSuperAdmin || userRole === 'admin_missao' || userRole === 'pastor';

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

  if (isLoading) {
    return (
        <aside className="flex flex-col w-64 bg-background border-r p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </aside>
    )
  }

  return (
    <aside className="flex flex-col w-64 bg-background border-r">
      <div className="p-4 border-b h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-light.png" alt="CBN Kerigma Logo" className="h-8 block dark:hidden" />
          <img src="/logo-dark.png" alt="CBN Kerigma Logo" className="h-8 hidden dark:block" />
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {isAdmin && renderSection("Geral", mainNavItems)}
        {isAdmin && renderSection("Comunidade", communityNavItems)}
        {isAdmin && renderSection("Recursos", resourcesNavItems)}
        {isSuperAdmin && renderSection("Administração", adminNavItems)}
      </nav>
      <div className="p-4 border-t">
        <nav className="space-y-1">
            {isSuperAdmin && renderLink(bottomNavItems[0])}
            {renderLink(bottomNavItems[1])}
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