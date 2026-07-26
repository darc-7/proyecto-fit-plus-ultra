import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { LoginButton } from "./LoginButton";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, role, userData, logout, motivationalQuote } = useContext(AuthContext);
  const hasTrainer = userData?.trainerId;

  return (
    <nav className="flex items-center justify-between p-4 bg-primary text-primary-foreground shadow-sm">
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground font-semibold transition-colors" viewTransition>Inicio</Link>
        {user && role === "cliente" && (
          <>
            <Link to="/profile" className="text-primary-foreground/70 hover:text-primary-foreground font-medium transition-colors" viewTransition>Perfil</Link>
            {hasTrainer && (
              <>
                <Link to="/exercises" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" viewTransition>Ejercicios</Link>
                <Link to="/routine" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" viewTransition>Rutina</Link>
              </>
            )}
            <Link to="/history" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" viewTransition>Historial</Link>
            <Link to="/store" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" viewTransition>Tienda</Link>
          </>
        )}
        {user && role === "administrador" && (
          <Link to="/admin/usuarios" className="text-primary-foreground/70 hover:text-primary-foreground font-medium transition-colors" viewTransition>Usuarios</Link>
        )}
        {user && role === "entrenador" && (
          <Link to="/clients" className="text-primary-foreground/70 hover:text-primary-foreground font-medium transition-colors" viewTransition>Clientes</Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {motivationalQuote && (
          <span className="hidden md:inline italic text-primary-foreground/60 max-w-md">
            {motivationalQuote}
          </span>
        )}

        {user ? (
          <Button variant="destructive" size="sm" onClick={logout}>
            Cerrar Sesión
          </Button>
        ): (
          <LoginButton />
        )}
        
      </div>
    </nav>
  );
}
