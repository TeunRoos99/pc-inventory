import React, { useEffect, useState } from 'react';
import api from '../api';
import { Table, PageHeader, SearchBar, Modal, FormField, Btn, StatusBadge } from '../components/UI';

const EMPTY = { nummer: '', merk: '', model: '', serienummer: '', snelheid: '', formaat: '', opslaggrootte: '', vrije_ruimte: '', leeg: '', gebruik: '', notities: '' };
const SNELHEID_OPTIONS = ['7200RPM', '5400RPM', '4200RPM', 'SSD', 'NVMe', 'DOOD'];
const FORMAAT_OPTIONS = ['3.5"', '2.5"', 'M.2', 'mSATA', 'DOOD'];
const JN_OPTIONS = ['Ja', 'Nee'];

export default function HardeschijvenPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => api.get('/api/harde-schijven').then(setItems);
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    [i.merk, i.model, i.serienummer, i.formaat, i.snelheid, i.gebruik, String(i.nummer || '')].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (item) => { setForm({ ...item }); setError(''); setModal(item); };
  const closeModal = () => setModal(null);
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (modal === 'add') await api.post('/api/harde-schijven', form);
      else await api.put(`/api/harde-schijven/${modal.id}`, form);
      await load();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Opslaan mislukt');
    }
  };

  const handleDelete = async (id) => { await api.delete(`/api/harde-schijven/${id}`); await load(); };

  const COLS = [
    { key: 'nummer', label: '#' },
    { key: 'merk', label: 'Merk' },
    { key: 'model', label: 'Model' },
    { key: 'snelheid', label: 'Snelheid', render: v => v === 'DOOD' ? <span className="badge badge-red">DOOD</span> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v || '—'}</span> },
    { key: 'formaat', label: 'Formaat', render: v => v === 'DOOD' ? <span className="badge badge-red">DOOD</span> : <span className="badge badge-blue">{v || '—'}</span> },
    { key: 'opslaggrootte', label: 'Capaciteit' },
    { key: 'vrije_ruimte', label: 'Vrij (GB)' },
    { key: 'leeg', label: 'Leeg', render: v => <StatusBadge value={v} /> },
    { key: 'gebruik', label: 'Gebruik', render: v => v ? <span style={{ color: 'var(--text2)', fontSize: 12 }}>{v}</span> : <span style={{ color: 'var(--text3)' }}>—</span> },
  ];

  return (
    <div style={{ padding: '40px 40px' }}>
      <PageHeader title="HARDE SCHIJVEN" subtitle={`${filtered.length} schijven`} onAdd={openAdd} />
      <SearchBar value={search} onChange={setSearch} placeholder="Zoek op merk, model, serienummer, gebruik..." />
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6 }}>
        <Table columns={COLS} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'HARDE SCHIJF TOEVOEGEN' : 'HARDE SCHIJF BEWERKEN'} onClose={closeModal}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Nummer" name="nummer" value={form.nummer} onChange={handleChange} type="number" />
            <FormField label="Merk" name="merk" value={form.merk} onChange={handleChange} />
            <FormField label="Model" name="model" value={form.model} onChange={handleChange} />
            <FormField label="Serienummer" name="serienummer" value={form.serienummer} onChange={handleChange} />
            <FormField label="Snelheid" name="snelheid" value={form.snelheid} onChange={handleChange} options={SNELHEID_OPTIONS} />
            <FormField label="Formaat" name="formaat" value={form.formaat} onChange={handleChange} options={FORMAAT_OPTIONS} />
            <FormField label="Opslaggrootte (GB)" name="opslaggrootte" value={form.opslaggrootte} onChange={handleChange} />
            <FormField label="Vrije ruimte (GB)" name="vrije_ruimte" value={form.vrije_ruimte} onChange={handleChange} />
            <FormField label="Leeg?" name="leeg" value={form.leeg} onChange={handleChange} options={JN_OPTIONS} />
          </div>
          <FormField label="Wordt gebruikt voor" name="gebruik" value={form.gebruik} onChange={handleChange} />
          <FormField label="Notities" name="notities" value={form.notities} onChange={handleChange} type="textarea" />
          {error && <p style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="secondary" onClick={closeModal}>Annuleren</Btn>
            <Btn onClick={handleSave}>Opslaan</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
