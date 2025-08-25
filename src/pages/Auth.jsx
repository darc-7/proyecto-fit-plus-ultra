import AuthRedirect from "../components/AuthRedirect";
import { GoogleSignIn } from "../components/GoogleSignIn";

export default function Auth() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="text-gray-600 block mb-10">
        ¡Para acceder a esta seccion debes iniciar sesion！
      </p>
      <AuthRedirect />
      <GoogleSignIn />
    </div>
  );
}