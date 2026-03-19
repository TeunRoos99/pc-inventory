import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.username, form.password);
      else await register(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 8, padding: 40, width: '100%', maxWidth: 380,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, color: 'var(--accent)', marginBottom: 8 }}>◈</div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: 2 }}>
            PC INVENTARIS
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {mode === 'login' ? 'INLOGGEN' : 'REGISTREREN'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 24, background: 'var(--bg)', borderRadius: 4, padding: 3, border: '1px solid var(--border)' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '7px 0',
                background: mode === m ? 'var(--bg3)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text3)',
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1,
                borderRadius: 3, border: mode === m ? '1px solid var(--border2)' : 'none',
                cursor: 'pointer', textTransform: 'uppercase',
              }}
            >
              {m === 'login' ? 'Inloggen' : 'Registreren'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
              Gebruikersnaam
            </label>
            <input name="username" value={form.username} onChange={handleChange} autoComplete="username" autoFocus />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
              Wachtwoord
            </label>
            <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.25)', borderRadius: 4, padding: '10px 14px', marginBottom: 16, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px', background: 'var(--accent)', color: '#000',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: 1,
              borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s', textTransform: 'uppercase',
            }}
          >
            {loading ? 'Bezig...' : (mode === 'login' ? 'Inloggen' : 'Registreren')}
          </button>
        </form>
      </div>
    </div>
  );
}
