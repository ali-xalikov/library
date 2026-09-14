import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/helpers';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        role={user.role}
        user={user}
        onLogout={logout}
      />
      <Navbar
        onSidebarToggle={() => setCollapsed((prev) => !prev)}
        user={user}
        onLogout={logout}
      />
      <main
        className={classNames(
          'pt-16 transition-all duration-300',
          collapsed ? 'ml-[72px]' : 'ml-[260px]'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}