import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const FIXED_CARDS = [
  { key: 'macs', label: 'Macs', icon: '⌘', to: '/macs', color: '#00e5ff' },
  { key: 'geheugen', label: 'Geheugenmodules', icon: '▤', to: '/geheugen', color: '#00ff88' },
  { key: 'videokaarten', label: 'Videokaarten', icon: '▣', to: '/videokaarten', color: '#ff6b35' },
  { key: 'harde_schijven', label: 'Harde Schijven', icon: '◉', to: '/harde-schijven', color: '#ffd700' },
  { key: 'cpu', label: "CPU's", icon: '◈', to: '/cpu', color: '#c084fc' },
];

function StatCard({ icon, color, count, label, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: 24, transition: 'border-color 0.15s, transform 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
      >
        <div style={{ fontSize: 22, color, marginBottom: 10 }}>{icon}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{count ?? '—'}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();
  const { customCategories } = useSettings();

  useEffect(() => { api.get('/api/stats').then(setStats).catch(() => {}); }, [customCategories]);

  return (
    <div className="page">
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--text)', fontWeight: 600, letterSpacing: 1 }}>OVERZICHT</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>Welkom, <strong style={{ color: 'var(--accent)' }}>{user?.username}</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 40 }}>
        {FIXED_CARDS.map(c => (
          <StatCard key={c.key} icon={c.icon} color={c.color} count={stats?.[c.key]} label={c.label} to={c.to} />
        ))}
        {customCategories.map(cat => (
          <StatCard key={cat.slug} icon={cat.icon} color={cat.color} count={stats?.custom?.[cat.slug]} label={cat.name} to={`/categorie/${cat.slug}`} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/instellingen" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', textDecoration: 'none', transition: 'border-color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          ⚙ Instellingen & Categorieën
        </Link>
      </div>
    </div>
  );
}
