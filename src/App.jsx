import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar"; // Opcional

export default function App() {
  return (
    <div className="app">
      <Navbar /> {/* Menú de navegación (opcional) */}
      <Outlet /> {/* ¡Aquí se renderizarán Auth, Exercises, etc.! */}
    </div>
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful');
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      },
    );
  });
}