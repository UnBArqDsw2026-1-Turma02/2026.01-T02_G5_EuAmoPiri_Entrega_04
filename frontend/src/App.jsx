/**
 * RAIZ DA APLICAÇÃO — Eu Amo Piri
 *
 * Monta os providers globais (Router, Auth) e renderiza as rotas.
 * Arquitetura em camadas:
 *   Context (AuthProvider) → Routes → Pages → Containers → Organisms → Molecules → Atoms
 */
/**import { BrowserRouter } from 'react-router-dom';
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

/*import React from 'react';
import SobrePiriPage from './LoginPage';
import './App.css';

function App() {
  return (
    <div>
      <SobrePiriPage />
    </div>
  );
}

export default App;*/

import React from 'react';
import LoginPage from "./pages/LoginPage"; // ou ./components/LoginPage
import './App.css';

function App() {
  return (
    <div>
      {/* Trocamos <SobrePiriPage /> por <LoginPage /> */}
      <LoginPage /> 
    </div>
  );
}

export default App;
