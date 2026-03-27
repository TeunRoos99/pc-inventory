import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [form, setForm] = useState({ username: '', password: '', reset_token: '', new_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const switchMode = m => { setMode(m); setError(''); setSuccess(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
        navigate('/');
      } else if (mode === 'register') {
        await register(form.username, form.password);
        navigate('/');
      } else {
        await axios.post('/api/auth/reset-password', {
          username: form.username,
          reset_token: form.reset_token,
          new_password: form.new_password,
        });
        setSuccess('Wachtwoord gewijzigd! Je kunt nu inloggen.');
        setForm(p => ({ ...p, reset_token: '', new_password: '' }));
        setTimeout(() => switchMode('login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'login', label: 'Inloggen' },
    { key: 'register', label: 'Registreren' },
    { key: 'reset', label: 'Wachtwoord reset' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid achtergrond */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.3,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 8, padding: 40, width: '100%', maxWidth: 400,
        margin: '0 16px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, color: 'var(--accent)', marginBottom: 8 }}>◈</div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: 2 }}>
            PC INVENTARIS
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {mode === 'login' ? 'INLOGGEN' : mode === 'register' ? 'REGISTREREN' : 'WACHTWOORD RESET'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 24, background: 'var(--bg)', borderRadius: 4, padding: 3, border: '1px solid var(--border)', gap: 2 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => switchMode(t.key)} style={{
              flex: 1, padding: '7px 4px',
              background: mode === t.key ? 'var(--bg3)' : 'transparent',
              color: mode === t.key ? 'var(--text)' : 'var(--text3)',
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 0.5,
              borderRadius: 3, border: mode === t.key ? '1px solid var(--border2)' : 'none',
              cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Gebruikersnaam — altijd zichtbaar */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
              Gebruikersnaam
            </label>
            <input name="username" value={form.username} onChange={handleChange} autoComplete="username" autoFocus />
          </div>

          {/* Wachtwoord (login + register) */}
          {mode !== 'reset' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
                Wachtwoord
              </label>
              <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>
          )}

          {/* Reset-velden */}
          {mode === 'reset' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
                  Reset-code
                </label>
                <input type="password" name="reset_token" value={form.reset_token} onChange={handleChange} placeholder="Ingesteld via RESET_TOKEN omgevingsvariabele" autoComplete="off" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
                  Nieuw wachtwoord
                </label>
                <input type="password" name="new_password" value={form.new_password} onChange={handleChange} autoComplete="new-password" />
              </div>
              <div style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 4, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                  Stel <strong style={{ color: 'var(--accent)' }}>RESET_TOKEN</strong> in als omgevingsvariabele in TrueNAS Scale (bij je app → Edit → Environment), voer hem hier in en kies een nieuw wachtwoord.
                </p>
              </div>
            </>
          )}

          {error && (
            <div style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.25)', borderRadius: 4, padding: '10px 14px', marginBottom: 16, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 4, padding: '10px 14px', marginBottom: 16, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {success}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px', background: 'var(--accent)', color: '#000',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: 1,
              borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s', textTransform: 'uppercase',
            }}
          >
            {loading ? 'Bezig...' : mode === 'login' ? 'Inloggen' : mode === 'register' ? 'Registreren' : 'Wachtwoord resetten'}
          </button>
        </form>
      </div>
    </div>
  );
}
