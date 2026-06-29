import { StrictMode, useEffect } from 'react';
import { createRoot }   from 'react-dom/client';
import { AppRouter }    from './router/index';
import { useAuthStore } from './features/auth/stores/auth.store';
import './index.css';

function App() {
  const loadUser = useAuthStore(state => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  return <AppRouter />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);