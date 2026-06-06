import AuthRedirect from "../components/AuthRedirect";
import { GoogleSignIn } from "../components/GoogleSignIn";
import { EmailAuthForm } from "../components/EmailAuthForm";

export default function Auth() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Redirección automática si ya está logueado */}
      <AuthRedirect />

      <div className="w-full max-w-md text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Fit Plus Ultra</h1>
        <p className="text-gray-600 text-sm">
          ¡Para acceder a esta sección debes iniciar sesión!
        </p>
      </div>

      {/* Módulo de Autenticación por Correo */}
      <EmailAuthForm />

      {/* Divisor estético */}
      <div className="w-full max-w-md flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">O continuar con</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Módulo de Autenticación de Google */}
      <div className="w-full max-w-md flex justify-center">
        <GoogleSignIn />
      </div>
    </div>
  );
}