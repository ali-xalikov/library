import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { LanguageProvider } from './i18n/LanguageContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import StartupSplash from './components/ui/StartupSplash';
import { routes } from './utils/routes';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function SuspenseFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function App() {
  const [splash, setSplash] = useState<'show' | 'exit' | 'hidden'>('show');

  useEffect(() => {
    const exitTimer = setTimeout(() => setSplash('exit'), 3200);
    const hideTimer = setTimeout(() => setSplash('hidden'), 3800);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
              <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route element={<Layout />}>
                    {routes.map(({ path, element: Component }) => (
                      <Route key={path} path={path} element={<Component />} />
                    ))}
                  </Route>
                </Routes>
              </Suspense>
              {splash !== 'hidden' && (
                <StartupSplash exiting={splash === 'exit'} />
              )}
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}