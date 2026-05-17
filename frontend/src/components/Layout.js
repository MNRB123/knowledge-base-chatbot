import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, FileText, BarChart2, LogOut, Menu, X, Bot, Shield } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    ...(user?.role === 'admin' ? [
      { to: '/documents', icon: FileText, label: 'Documents' },
      { to: '/admin', icon: BarChart2, label: 'Analytics' },
    ] : [])
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Bot size={24} className="logo-icon" />
            {sidebarOpen && <span className="logo-text">KnowledgeBot</span>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={`user-info ${!sidebarOpen ? 'collapsed' : ''}`}>
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            {sidebarOpen && (
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">
                  {user?.role === 'admin' && <Shield size={10} />} {user?.role}
                </span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
