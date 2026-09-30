import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { LoginButton } from "./LoginButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ClipboardList,
  Dumbbell,
  History as HistoryIcon,
  LogOut,
  Menu,
  ShoppingBag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = {
  cliente: [
    { to: "/profile", label: "Perfil", icon: User },
    { to: "/exercises", label: "Ejercicios", icon: Dumbbell, requiresTrainer: true },
    { to: "/routine", label: "Rutina", icon: ClipboardList, requiresTrainer: true },
    { to: "/history", label: "Historial", icon: HistoryIcon },
    { to: "/store", label: "Tienda", icon: ShoppingBag },
  ],
  administrador: [
    { to: "/admin/usuarios", label: "Usuarios", icon: User },
  ],
  entrenador: [
    { to: "/clients", label: "Clientes", icon: User },
  ],
};

export default function Navbar() {
  const { user, role, userData, logout } = useContext(AuthContext);
  const location = useLocation();
  const hasTrainer = !!userData?.trainerId;
  const [menuOpen, setMenuOpen] = useState(false);

  const links = role ? (navLinks[role] || []) : [];
  const visibleLinks = links.filter(
    (l) => !l.requiresTrainer || hasTrainer
  );
  const isClient = role === "cliente";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/70 border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 h-16">
        <Link to="/" className="font-bold text-xl tracking-tight shrink-0">
          <span className="text-foreground">Fit Plus </span>
          <span className="text-primary">ULTRA</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                viewTransition
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {isClient && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="md:hidden"
                    aria-label="Abrir menú de navegación"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[82%] max-w-xs p-0 flex flex-col"
              >
                <SheetHeader className="p-5 border-b border-border/60 text-left">
                  <SheetTitle className="text-lg font-bold tracking-tight">
                    <span className="text-foreground">Fit Plus </span>
                    <span className="text-primary">ULTRA</span>
                  </SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">
                    {userData?.displayName
                      ? `Hola, ${userData.displayName}`
                      : "Navegación principal"}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-1 p-3">
                  {visibleLinks.map((link) => (
                    <SheetClose
                      key={link.to}
                      render={<Link to={link.to} viewTransition />}
                      nativeButton={false}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base font-medium transition-colors",
                        location.pathname === link.to
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <link.icon className="size-5 shrink-0" />
                      {link.label}
                    </SheetClose>
                  ))}
                </div>

                <div className="mt-auto p-3 border-t border-border/60">
                  <Button
                    variant="destructive"
                    className="w-full justify-center"
                    onClick={logout}
                  >
                    <LogOut />
                    Cerrar Sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {user ? (
            isClient ? (
              <Button
                variant="destructive"
                size="icon-lg"
                className="md:hidden"
                onClick={logout}
                aria-label="Cerrar Sesión"
              >
                <LogOut />
              </Button>
            ) : null
          ) : (
            <LoginButton />
          )}

          {user && (
            <Button
              variant="destructive"
              size="sm"
              className="hidden md:inline-flex"
              onClick={logout}
            >
              Cerrar Sesión
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
