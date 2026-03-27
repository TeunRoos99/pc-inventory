import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetWachtwoordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Wachtwoorden komen niet overeen');
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password-token', { token, new_password: password });
      setSuccess('Wachtwoord gewijzigd! Je wordt doorgestuurd...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 14 }}>Ongeldige reset-link.</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 8, padding: 40, width: '100%', maxWidth: 380, margin: '0 16px' }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, color: 'var(--accent)', marginBottom: 8 }}>◈</div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: 2 }}>NIEUW WACHTWOORD</h1>
        </div>

        {success ? (
          <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 4, padding: '12px 16px', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{success}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>Nieuw wachtwoord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus autoComplete="new-password" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>Bevestig wachtwoord</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            {error && <div style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.25)', borderRadius: 4, padding: '10px 14px', marginBottom: 16, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 11, background: 'var(--accent)', color: '#000', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: 1, borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, textTransform: 'uppercase' }}>
              {loading ? 'Bezig...' : 'Wachtwoord opslaan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
