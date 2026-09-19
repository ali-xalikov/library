import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { LanguageProvider } from './i18n/LanguageContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { routes } from './utils/routes';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
              <Suspense fallback={<LoadingSpinner />}>
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
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}