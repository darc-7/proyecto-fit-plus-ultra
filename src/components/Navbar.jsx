import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { LoginButton } from "./LoginButton";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, role, userData, logout, motivationalQuote } = useContext(AuthContext);
  const hasTrainer = userData?.trainerId;

  return (
    <nav className="flex items-center justify-between p-4 bg-muted">
      <div className="flex gap-4">
        <Link to="/" className="hover:text-blue-500" viewTransition>Inicio</Link>
        {user && role === "cliente" && (
          <>
            <Link to="/profile" className="text-foreground/70 hover:text-blue-600 font-medium transition-colors" viewTransition>Perfil</Link>
            {hasTrainer && (
              <>
                <Link to="/exercises" className="hover:text-blue-500" viewTransition>Ejercicios</Link>
                <Link to="/routine" className="hover:text-blue-500" viewTransition>Rutina</Link>
              </>
            )}
            <Link to="/history" className="hover:text-blue-500" viewTransition>Historial</Link>
            <Link to="/store" className="hover:text-blue-500" viewTransition>Tienda</Link>
          </>
        )}
        {user && role === "administrador" && (
          <Link to="/admin/usuarios" className="text-foreground/70 hover:text-blue-600 font-medium transition-colors" viewTransition>Usuarios</Link>
        )}
        {user && role === "entrenador" && (
          <Link to="/clients" className="text-foreground/70 hover:text-blue-600 font-medium transition-colors" viewTransition>Clientes</Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {motivationalQuote && (
          <span className="hidden md:inline italic text-muted-foreground max-w-md">
            {motivationalQuote}
          </span>
        )}

        {user ? (
          <Button variant="destructive" onClick={logout}>
            Cerrar Sesión
          </Button>
        ): (
          <LoginButton />
        )}
        
      </div>
    </nav>
  );
}
