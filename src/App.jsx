import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar"; // Opcional
import FloatingTimer from "./components/FloatingTimer";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <div className="app min-h-screen flex flex-col">
      <Toaster position="bottom-center" />
      <FloatingTimer />
      <main className="flex-1">
        <Navbar />
        <Outlet /> {/* ¡Aquí se renderizarán Auth, Exercises, etc.! */}
      </main>
      <Footer />
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