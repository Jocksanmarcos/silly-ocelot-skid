import { Menu, Sun, Moon, Book, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useTheme } from "@/contexts/ThemeProvider";
import UserNav from "./UserNav";

const Header = () => {
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/sobre", label: "A Igreja" },
    { href: "/celulas", label: "Células" },
    { href: "/agenda", label: "Agenda" },
    { href: "/pregacoes", label: "Pregações" },
    { href: "/cursos", label: "Cursos" },
    { href: "/semear", label: "Contribua" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Left Section: Desktop Navigation & Mobile Trigger */}
        <div className="flex items-center lg:w-1/3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden mr-4">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navLinks.slice(0, 3).map(link => (
                <NavigationMenuItem key={link.href}>
                  <Link to={link.href}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Center Section: Branding */}
        <div className="flex justify-center lg:w-1/3">
          <Link to="/" className="flex items-center">
            <img src="/logo-light.png" alt="CBN Kerigma Logo" className="h-10 block dark:hidden" />
            <img src="/logo-dark.png" alt="CBN Kerigma Logo" className="h-10 hidden dark:block" />
          </Link>
        </div>

        {/* Right Section: Actions & More Nav */}
        <div className="flex items-center justify-end gap-2 lg:w-1/3">
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navLinks.slice(3).map(link => (
                <NavigationMenuItem key={link.href}>
                  <Link to={link.href}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Global Actions */}
          <Button variant="ghost" size="icon">
            <Book className="h-5 w-5" />
            <span className="sr-only">Consulta Bíblica</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificações</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {session ? <UserNav /> : <Button asChild><Link to="/login">Login</Link></Button>}
        </div>
      </div>
    </header>
  );
};

export default Header;