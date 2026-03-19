import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import useIsMobile from '../hooks/useIsMobile';

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
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sluit drawer bij navigeren
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinkStyle = (isActive, color) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: collapsed && !isMobile ? '12px 16px' : '12px 20px',
    color: isActive ? (color || 'var(--accent)') : 'var(--text2)',
    background: isActive ? 'rgba(0,229,255,0.05)' : 'transparent',
    borderLeft: isActive ? `3px solid ${color || 'var(--accent)'}` : '3px solid transparent',
    fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 0.5,
    transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden', textDecoration: 'none',
    minHeight: 44, // touch-vriendelijk minimum
  });

  const SidebarContent = () => (
    <>
      {/* Logo + sluit-knop (alleen mobiel) */}
      <div style={{
        padding: '0 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 18, fontWeight: 600 }}>◈</span>
          {(!collapsed || isMobile) && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)', letterSpacing: 1 }}>
              PC INVENTARIS
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ background: 'none', color: 'var(--text2)', fontSize: 22, padding: '8px', lineHeight: 1, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Menu sluiten"
          >✕</button>
        )}
      </div>

      {/* Nav-items */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {FIXED_NAV.map(({ to, label, icon, exact }) => (
          <NavLink key={to} to={to} end={exact} style={({ isActive }) => navLinkStyle(isActive)}>
            <span style={{ fontSize: 16, flexShrink: 0, minWidth: 20, textAlign: 'center' }}>{icon}</span>
            {(!collapsed || isMobile) && <span>{label}</span>}
          </NavLink>
        ))}

        {customCategories.length > 0 && (
          <>
            {(!collapsed || isMobile) && (
              <div style={{ padding: '12px 20px 4px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>
                Eigen Categorieën
              </div>
            )}
            {customCategories.map(cat => (
              <NavLink key={cat.slug} to={`/categorie/${cat.slug}`} style={({ isActive }) => navLinkStyle(isActive, cat.color)}>
                <span style={{ fontSize: 16, flexShrink: 0, color: cat.color, minWidth: 20, textAlign: 'center' }}>{cat.icon}</span>
                {(!collapsed || isMobile) && <span>{cat.name}</span>}
              </NavLink>
            ))}
          </>
        )}

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
          <NavLink to="/prullenbak" style={({ isActive }) => navLinkStyle(isActive)}>
            <span style={{ fontSize: 16, flexShrink: 0, minWidth: 20, textAlign: 'center' }}>🗑</span>
            {(!collapsed || isMobile) && 'Prullenbak'}
          </NavLink>
          <NavLink to="/instellingen" style={({ isActive }) => navLinkStyle(isActive)}>
            <span style={{ fontSize: 16, flexShrink: 0, minWidth: 20, textAlign: 'center' }}>⚙</span>
            {(!collapsed || isMobile) && 'Instellingen'}
          </NavLink>
        </div>
      </nav>

      {/* Footer: gebruiker + uitloggen */}
      <div style={{ padding: collapsed && !isMobile ? '16px 12px' : '16px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {(!collapsed || isMobile) && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            @{user?.username}
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{ background: 'transparent', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s', minHeight: 36, padding: '4px 0' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          <span>⏻</span>
          {(!collapsed || isMobile) && 'UITLOGGEN'}
        </button>
      </div>
    </>
  );

  // ── Mobiel layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
        {/* Vaste topbalk */}
        <header style={{
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          height: 56, padding: '0 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 18, fontWeight: 600 }}>◈</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)', letterSpacing: 1 }}>
              PC INVENTARIS
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ background: 'none', color: 'var(--text2)', fontSize: 22, padding: '8px', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
            aria-label="Menu openen"
          >☰</button>
        </header>

        {/* Slide-in drawer */}
        {drawerOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            {/* Backdrop */}
            <div
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
            />
            {/* Drawer */}
            <aside style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 280,
              background: 'var(--bg2)', borderRight: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              animation: 'slideIn 0.2s ease',
            }}>
              <SidebarContent />
            </aside>
          </div>
        )}

        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', WebkitOverflowScrolling: 'touch' }}>
          <Outlet />
        </main>
      </div>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: collapsed ? 56 : 220,
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease', overflow: 'hidden', flexShrink: 0,
      }}>
        <SidebarContent />
      </aside>

      {/* Collapse-knop */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'absolute', left: collapsed ? 40 : 204, top: 28,
          zIndex: 100, background: 'var(--bg3)', border: '1px solid var(--border)',
          color: 'var(--text2)', width: 20, height: 20, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, transition: 'left 0.2s ease', cursor: 'pointer',
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
