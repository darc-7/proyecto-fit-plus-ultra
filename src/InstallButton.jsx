import { useState, useEffect } from 'react';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      console.log("Evento 'beforeinstallprompt' capturado!", e);
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("Usuario eligió:", outcome);
    setDeferredPrompt(null);
  };

  console.log("Valor de deferredPrompt:", deferredPrompt); // Debug

  if (!deferredPrompt) return null;

  return (
    <button 
      onClick={handleInstall}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
    >
      Instalar App
    </button>
  );
}