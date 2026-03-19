import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const FIXED_NAV = [
  { to: '/', label: 'Dashboard', icon: '◈', exact: true },
  { to: '/macs', label: 'Macs', icon: '⌘' },
  { to: '/geheugen', label: 'Geheugen', icon: '▤' },
  { to: '/videokaarten', label: 'Videokaarten', icon: '▣' },
  { to: '/harde-schijven', label: 'Harde Schijven', icon: '◉' },
  { to: '/cpu', label: 'CPU', icon: '◈' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { customCategories } = useSettings();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinkStyle = (isActive, color) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: collapsed ? '10px 16px' : '10px 20px',
    color: isActive ? (color || 'var(--accent)') : 'var(--text2)',
    background: isActive ? `rgba(0,0,0,0.06)` : 'transparent',
    borderLeft: isActive ? `2px solid ${color || 'var(--accent)'}` : '2px solid transparent',
    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 0.5,
    transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden', textDecoration: 'none',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: collapsed ? 56 : 220,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 60 }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 18, fontWeight: 600, flexShrink: 0 }}>◈</span>
          {!collapsed && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)', letterSpacing: 1, whiteSpace: 'nowrap' }}>PC INVENTARIS</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {FIXED_NAV.map(({ to, label, icon, exact }) => (
            <NavLink key={to} to={to} end={exact}
              style={({ isActive }) => navLinkStyle(isActive)}
              onMouseEnter={e => { if (!e.currentTarget.style.borderLeftColor.includes('var')) return; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => {}}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
              {!collapsed && label}
            </NavLink>
          ))}

          {/* Custom categories */}
          {customCategories.length > 0 && (
            <>
              {!collapsed && (
                <div style={{ padding: '12px 20px 4px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Eigen Categorieën
                </div>
              )}
              {customCategories.map(cat => (
                <NavLink key={cat.slug} to={`/categorie/${cat.slug}`}
                  style={({ isActive }) => navLinkStyle(isActive, cat.color)}
                >
                  <span style={{ fontSize: 14, flexShrink: 0, color: cat.color }}>{cat.icon}</span>
                  {!collapsed && cat.name}
                </NavLink>
              ))}
            </>
          )}

          {/* Settings */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
            <NavLink to="/instellingen" style={({ isActive }) => navLinkStyle(isActive)}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>⚙</span>
              {!collapsed && 'Instellingen'}
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: collapsed ? '16px' : '16px 20px', borderTop: '1px solid var(--border)' }}>
          {!collapsed && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{user?.username}</div>}
          <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >
            <span>⏻</span>{!collapsed && 'UITLOGGEN'}
          </button>
        </div>
      </aside>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} style={{ position: 'absolute', left: collapsed ? 40 : 204, top: 28, zIndex: 100, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, transition: 'left 0.2s ease', cursor: 'pointer' }}>
        {collapsed ? '›' : '‹'}
      </button>

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
