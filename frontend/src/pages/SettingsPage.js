import React, { useState, useRef } from 'react';
import api from '../api';
import { useSettings } from '../context/SettingsContext';
import { Modal, FormField, Btn } from '../components/UI';
import axios from 'axios';

const ICONS = ['◆', '◈', '▤', '▣', '◉', '⌘', '⊞', '⊗', '⊕', '★', '✦', '⬡', '⬢', '◭', '◮', '⚙', '⚡', '♦', '▲', '●'];
const COLORS = ['#00e5ff','#00ff88','#ff6b35','#ffd700','#c084fc','#f472b6','#34d399','#60a5fa','#fb923c','#a78bfa','#f87171','#4ade80'];

const EMPTY_CAT = { name: '', icon: '◆', color: '#00e5ff', columns: [] };
const EMPTY_COL = { label: '', key: '' };

export default function SettingsPage() {
  const { theme, setTheme, customCategories, loadCustomCategories } = useSettings();
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [catModal, setCatModal] = useState(null); // null | 'add' | category
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [catError, setCatError] = useState('');
  const [delConfirm, setDelConfirm] = useState(null);
  const [newCol, setNewCol] = useState(EMPTY_COL);
  const [importStatus, setImportStatus] = useState(null);
  const importRef = useRef();

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/export', { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const cd = res.headers.get('Content-Disposition') || '';
    const name = cd.match(/filename="(.+)"/)?.[1] || 'inventory-export.json';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportStatus({ loading: true });
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/import', data, { headers: { Authorization: `Bearer ${token}` } });
      setImportStatus({ success: true, added: res.data.added, skipped: res.data.skipped });
      await loadCustomCategories();
    } catch (err) {
      setImportStatus({ error: err.response?.data?.error || 'Importeren mislukt' });
    }
    e.target.value = '';
  };

  const handlePwChange = e => setPwForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.new_password !== pwForm.confirm) return setPwError('Wachtwoorden komen niet overeen');
    try {
      await api.put('/api/settings/password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwSuccess('Wachtwoord gewijzigd!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Mislukt');
    }
  };

  const openAddCat = () => { setCatForm(EMPTY_CAT); setCatError(''); setCatModal('add'); };
  const openEditCat = (cat) => { setCatForm({ name: cat.name, icon: cat.icon, color: cat.color, columns: [...(cat.columns || [])] }); setCatError(''); setCatModal(cat); };
  const closeCatModal = () => setCatModal(null);

  const handleCatSave = async () => {
    if (!catForm.name.trim()) return setCatError('Naam verplicht');
    try {
      if (catModal === 'add') await api.post('/api/custom-categories', catForm);
      else await api.put(`/api/custom-categories/${catModal.id}`, catForm);
      await loadCustomCategories();
      closeCatModal();
    } catch (err) {
      setCatError(err.response?.data?.error || 'Opslaan mislukt');
    }
  };

  const handleDeleteCat = async (id) => {
    try {
      await api.delete(`/api/custom-categories/${id}`);
      await loadCustomCategories();
      setDelConfirm(null);
    } catch {}
  };

  const addColumn = () => {
    if (!newCol.label.trim()) return;
    const key = newCol.key.trim() || newCol.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCatForm(p => ({ ...p, columns: [...p.columns, { label: newCol.label, key }] }));
    setNewCol(EMPTY_COL);
  };

  const removeColumn = (idx) => setCatForm(p => ({ ...p, columns: p.columns.filter((_, i) => i !== idx) }));

  return (
    <div style={{ padding: '40px', maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--text)', fontWeight: 600, letterSpacing: 1, marginBottom: 32 }}>INSTELLINGEN</h1>

      {/* ── Data ── */}
      <Section title="Data">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn onClick={handleExport}>↓ Exporteren</Btn>
          <Btn variant="secondary" onClick={() => importRef.current.click()}>↑ Importeren</Btn>
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          {importStatus?.loading && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>Bezig met importeren...</span>}
          {importStatus?.success && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>Geimporteerd: {importStatus.added} toegevoegd, {importStatus.skipped} overgeslagen</span>}
          {importStatus?.error && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>{importStatus.error}</span>}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 10 }}>
          Export slaat alle items uit alle categorieën op als JSON. Bij import worden bestaande records overgeslagen (geen duplicaten).
        </p>
      </Section>

      {/* ── Thema ── */}
      <Section title="Weergave">
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { val: 'dark', label: '◑ Donker', desc: 'Donkere achtergrond' },
            { val: 'light', label: '◎ Licht', desc: 'Lichte achtergrond' },
          ].map(t => (
            <button key={t.val} onClick={() => setTheme(t.val)} style={{
              flex: 1, padding: '14px 20px', borderRadius: 6, cursor: 'pointer',
              background: theme === t.val ? 'rgba(0,150,220,0.08)' : 'var(--bg3)',
              border: `2px solid ${theme === t.val ? 'var(--accent)' : 'var(--border)'}`,
              color: theme === t.val ? 'var(--accent)' : 'var(--text2)',
              fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'left',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Wachtwoord ── */}
      <Section title="Wachtwoord Wijzigen">
        <form onSubmit={handlePwSave} style={{ maxWidth: 360 }}>
          <FormField label="Huidig wachtwoord" name="current_password" value={pwForm.current_password} onChange={handlePwChange} type="password" />
          <FormField label="Nieuw wachtwoord" name="new_password" value={pwForm.new_password} onChange={handlePwChange} type="password" />
          <FormField label="Bevestig nieuw wachtwoord" name="confirm" value={pwForm.confirm} onChange={handlePwChange} type="password" />
          {pwError && <p style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 10 }}>{pwError}</p>}
          {pwSuccess && <p style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 10 }}>{pwSuccess}</p>}
          <Btn type="submit">Opslaan</Btn>
        </form>
      </Section>

      {/* ── Eigen Categorieën ── */}
      <Section title="Eigen Categorieën" action={<Btn small onClick={openAddCat}>+ Nieuwe categorie</Btn>}>
        {customCategories.length === 0 && (
          <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}>Nog geen eigen categorieën.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customCategories.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4 }}>
              <span style={{ fontSize: 18, color: cat.color }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{(cat.columns || []).length} kolommen</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn small variant="ghost" onClick={() => openEditCat(cat)}>✎ Bewerken</Btn>
                {delConfirm === cat.id ? (
                  <>
                    <Btn small variant="danger" onClick={() => handleDeleteCat(cat.id)}>Ja, verwijder</Btn>
                    <Btn small variant="secondary" onClick={() => setDelConfirm(null)}>Nee</Btn>
                  </>
                ) : (
                  <Btn small variant="danger" onClick={() => setDelConfirm(cat.id)}>✕</Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Category modal */}
      {catModal && (
        <Modal title={catModal === 'add' ? 'CATEGORIE AANMAKEN' : 'CATEGORIE BEWERKEN'} onClose={closeCatModal} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Naam" name="name" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} />
            </div>

            {/* Icon picker */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>Icoon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setCatForm(p => ({ ...p, icon: ic }))} style={{
                    width: 36, height: 36, fontSize: 16, background: catForm.icon === ic ? 'rgba(0,150,220,0.15)' : 'var(--bg3)',
                    border: `1px solid ${catForm.icon === ic ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 4, cursor: 'pointer', color: catForm.icon === ic ? 'var(--accent)' : 'var(--text)',
                  }}>{ic}</button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>Kleur</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setCatForm(p => ({ ...p, color: c }))} style={{
                    width: 28, height: 28, background: c, borderRadius: '50%', cursor: 'pointer',
                    border: catForm.color === c ? '3px solid var(--text)' : '2px solid transparent',
                    outline: catForm.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2,
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Columns */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Kolommen</label>
            {catForm.columns.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 8 }}>Nog geen kolommen — voeg er hieronder toe.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {catForm.columns.map((col, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, flex: 1, color: 'var(--text)' }}>{col.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>key: {col.key}</span>
                  <button onClick={() => removeColumn(i)} style={{ background: 'none', color: 'var(--red)', fontSize: 14, cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Kolomnaam (bijv. Merk)" value={newCol.label} onChange={e => setNewCol(p => ({ ...p, label: e.target.value }))} style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addColumn()} />
              <input placeholder="Sleutel (optioneel)" value={newCol.key} onChange={e => setNewCol(p => ({ ...p, key: e.target.value }))} style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addColumn()} />
              <Btn onClick={addColumn} small>+ Toevoegen</Btn>
            </div>
            <p style={{ color: 'var(--text3)', fontSize: 11, marginTop: 6 }}>Druk Enter of klik + Toevoegen om een kolom toe te voegen.</p>
          </div>

          {catError && <p style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}>{catError}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="secondary" onClick={closeCatModal}>Annuleren</Btn>
            <Btn onClick={handleCatSave}>Opslaan</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase' }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
