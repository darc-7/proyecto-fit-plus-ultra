import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { LoginButton } from "./LoginButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = {
  cliente: [
    { to: "/profile", label: "Perfil" },
    { to: "/exercises", label: "Ejercicios", requiresTrainer: true },
    { to: "/routine", label: "Rutina", requiresTrainer: true },
    { to: "/history", label: "Historial" },
    { to: "/store", label: "Tienda" },
  ],
  administrador: [
    { to: "/admin/usuarios", label: "Usuarios" },
  ],
  entrenador: [
    { to: "/clients", label: "Clientes" },
  ],
};

export default function Navbar() {
  const { user, role, userData, logout } = useContext(AuthContext);
  const location = useLocation();
  const hasTrainer = !!userData?.trainerId;

  const links = role ? (navLinks[role] || []) : [];
  const visibleLinks = links.filter(
    (l) => !l.requiresTrainer || hasTrainer
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/70 border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
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

        <div className="flex items-center gap-3">
          {user ? (
            <Button variant="destructive" size="sm" onClick={logout}>
              Cerrar Sesión
            </Button>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
}
