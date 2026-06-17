/**
 * RAIZ DA APLICAÇÃO — Eu Amo Piri
 *
 * Monta os providers globais (Router, Auth) e renderiza as rotas.
 * Arquitetura em camadas:
 *   Context (AuthProvider) → Routes → Pages → Containers → Organisms → Molecules → Atoms
 */
/*import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}*/

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from "./pages/LoginPage"; // Verifique se o caminho está correto
import './styles/global.css';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Renderiza o seu Login direto na página inicial com o contexto ativo */}
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
}
