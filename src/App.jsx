import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import FloatingTimer from "./components/FloatingTimer";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <div className="app min-h-screen flex flex-col bg-background">
      <Toaster position="bottom-center" />
      <FloatingTimer />
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
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
