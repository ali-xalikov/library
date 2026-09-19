import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-md lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        role={user.role}
        user={user}
        onLogout={logout}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <Navbar
        onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
        onDesktopToggle={() => setCollapsed((prev) => !prev)}
        collapsed={collapsed}
        user={user}
        onLogout={logout}
      />

      <main
        className={[
          'pt-16 transition-all duration-300 ease-out',
          // Desktop: shift based on sidebar state
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]',
          // Mobile: no shift
          'ml-0',
        ].join(' ')}
      >
        <div
          key={location.pathname}
          className="animate-rise p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
