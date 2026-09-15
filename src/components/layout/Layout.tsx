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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
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
          'pt-16 transition-all duration-300',
          // Desktop: shift based on sidebar state
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]',
          // Mobile: no shift
          'ml-0',
        ].join(' ')}
      >
        <div className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
