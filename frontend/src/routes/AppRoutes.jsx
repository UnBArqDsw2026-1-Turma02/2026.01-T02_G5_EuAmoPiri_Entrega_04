/**
 * CAMADA ROTAS — AppRoutes
 *
 * Define todas as rotas da aplicação com React Router v6.
 * Rotas protegidas usam o componente ProtectedRoute.
 *
 * Lazy loading: cada página é carregada sob demanda para
 * melhor performance (reutilização do sistema de módulos do Vite).
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../presentation/atoms/Spinner';
import PageLayout from '../presentation/organisms/PageLayout';

/* ─── Carregamento lazy das páginas ─── */
const PlacesPage           = lazy(() => import('../pages/PlacesPage'));
const PlaceDetailPage      = lazy(() => import('../pages/PlaceDetailPage'));
const LoginPage            = lazy(() => import('../pages/LoginPage'));
const SignupPage           = lazy(() => import('../pages/SignupPage'));
const CreatePlacePage      = lazy(() => import('../pages/CreatePlacePage'));
const EditPlacePage        = lazy(() => import('../pages/EditPlacePage'));
const MoradorDashboard     = lazy(() => import('../pages/MoradorDashboard'));
const CreateExperiencePage = lazy(() => import('../pages/CreateExperiencePage'));
const EditExperiencePage   = lazy(() => import('../pages/EditExperiencePage'));
const TuristaDashboard     = lazy(() => import('../pages/TuristaDashboard'));
const ProfilePage          = lazy(() => import('../pages/ProfilePage'));
const SobrePiriPage        = lazy(() => import('../pages/SobrePiriPage'));
const NotFoundPage         = lazy(() => import('../pages/NotFoundPage'));

/* ─── Componente de rota protegida ─── */
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ─── Loading fallback ─── */
function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spinner size="lg" />
    </div>
  );
}

/* ─── Definição das rotas ─── */
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Públicas — com layout (Header + Footer) */}
        <Route element={<PageLayout />}>
          <Route path="/"           element={<PlacesPage />} />
          <Route path="/locais"     element={<PlacesPage />} />
          <Route path="/locais/:id" element={<PlaceDetailPage />} />
          <Route path="/sobre-piri" element={<SobrePiriPage />} />

          {/* Protegidas — qualquer usuário logado */}
          <Route path="/perfil" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Protegidas — Morador */}
          <Route path="/morador/painel" element={
            <ProtectedRoute requiredRole="morador"><MoradorDashboard /></ProtectedRoute>
          } />
          <Route path="/morador/locais/novo" element={
            <ProtectedRoute requiredRole="morador"><CreatePlacePage /></ProtectedRoute>
          } />
          <Route path="/morador/locais/:id/editar" element={
            <ProtectedRoute requiredRole="morador"><EditPlacePage /></ProtectedRoute>
          } />

          {/* Protegidas — Turista */}
          <Route path="/turista/painel" element={
            <ProtectedRoute requiredRole="turista"><TuristaDashboard /></ProtectedRoute>
          } />
          <Route path="/locais/:placeId/relatos/novo" element={
            <ProtectedRoute requiredRole="turista"><CreateExperiencePage /></ProtectedRoute>
          } />
          <Route path="/locais/:placeId/relatos/:id/editar" element={
            <ProtectedRoute requiredRole="turista"><EditExperiencePage /></ProtectedRoute>
          } />
        </Route>

        {/* Sem layout (tela cheia — login e cadastro) */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
