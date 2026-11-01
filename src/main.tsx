import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline PWA functionality
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] Versi baru tersedia');
  },
  onOfflineReady() {
    console.log('[PWA] Siap digunakan offline dengan Service Worker');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
