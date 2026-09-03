import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { StoreProvider, useStore } from './store';
import { AiSettingsProvider } from './ai/AiSettingsProvider';
import { Dashboard } from './Dashboard';
import { Workspace } from './Workspace';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { AiAssistant } from './components/AiAssistant';

function AppShell() {
  const { loading, authReady, passwordRecovery } = useAuth();
  const { currentProjectId } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center hub-page-glow">
        <div className="flex flex-col items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none" className="animate-pulse">
            <rect width="28" height="28" rx="7" fill="var(--primary)" />
            <path d="M14 4L24 14L14 24L4 14L14 4Z" fill="white" fillOpacity="0.9" />
            <path d="M14 9L19 14L14 19L9 14L14 9Z" fill="var(--primary)" />
            <circle cx="14" cy="14" r="2.5" fill="white" />
          </svg>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Opening hub</p>
        </div>
      </div>
    );
  }

  if (passwordRecovery) return <Navigate to="/reset-password" replace />;
  if (!authReady) return <Login />;

  return (
    <>
      {currentProjectId ? <Workspace /> : <Dashboard />}
      <AiAssistant />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AiSettingsProvider>
          <StoreProvider>
            <Routes>
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/*" element={<AppShell />} />
            </Routes>
          </StoreProvider>
        </AiSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
