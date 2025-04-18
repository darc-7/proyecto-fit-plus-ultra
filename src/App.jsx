import { useState } from 'react';
// import { InstallButton } from './InstallButton';
import { GoogleSignIn } from "./components/GoogleSignIn";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='title'>
        Hello World!
      </div>
      <GoogleSignIn />
    </>
  )
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

export default App
