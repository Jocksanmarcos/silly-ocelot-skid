import { NavLink, Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Paintbrush, UserCircle, Shield } from "lucide-react";

const settingsNav = [
  { href: "/dashboard/settings/appearance", label: "Aparência", icon: Paintbrush },
  { href: "/dashboard/settings/profile", label: "Perfil", icon: UserCircle },
  { href: "/dashboard/settings/security", label: "Segurança", icon: Shield },
];

const SettingsLayout = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e da plataforma.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            {settingsNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    isActive && "bg-muted text-primary"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-3">
          <Card>
            <CardContent className="p-6">
              <Outlet />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;