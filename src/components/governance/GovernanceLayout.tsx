import { NavLink, Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Network, Lock, History } from "lucide-react";

const governanceNav = [
  { href: "/dashboard/governance/permissions", label: "Gestão de Cargos", icon: Shield },
  { href: "/dashboard/governance/hierarchy", label: "Hierarquia", icon: Network },
  { href: "/dashboard/governance/security", label: "Segurança", icon: Lock },
  { href: "/dashboard/governance/audit-logs", label: "Logs de Auditoria", icon: History },
];

const GovernanceLayout = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Governança</h1>
        <p className="text-muted-foreground">
          Gerencie a segurança, permissões e regras da plataforma.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            {governanceNav.map((item) => (
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

export default GovernanceLayout;