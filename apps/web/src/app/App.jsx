// =============================================================================
// Socle frontend — racine de l'application
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// AuthProvider restaure la session (cookies HTTP-only) avant toute page protégée.
// =============================================================================
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthContext.jsx';
import { router } from './router.jsx';

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
