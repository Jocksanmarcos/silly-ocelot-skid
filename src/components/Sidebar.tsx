import { Link, useLocation, useNavigate } from "react-router-dom";
import { Church, Users, Calendar, DollarSign, LayoutDashboard, LogOut, Home, Sitemap, HeartHandshake, GraduationCap, Handshake, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/dashboard/visitors", icon: Handshake, label: "Recepção" },
  { href: "/dashboard/members", icon: Users, label: "Pessoas" },
  { href: "/dashboard/journey", icon: TrendingUp, label: "Jornada" },
  { href: "/dashboard/families", icon: HeartHandshake, label: "Famílias" },
  { href: "/dashboard/cells", icon: Home, label: "Células" },
  { href: "/dashboard/events", icon: Calendar, label: "Eventos" },
  { href: "/dashboard/courses", icon: GraduationCap, label: "Ensino" },
  { href: "/dashboard/finances", icon: DollarSign, label: "Finanças" },
  { href: "/dashboard/hierarchy", icon: Sitemap, label: "Hierarquia" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r">
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <Church className="h-6 w-6" />
          <span className="font-bold">CBN Kerigma Gestão</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              location.pathname.startsWith(item.href) && (item.href !== '/dashboard' || location.pathname === '/dashboard')
                ? "bg-muted text-primary"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;