import React, { useEffect, useState } from 'react';
import api from '../api';
import { Table, PageHeader, SearchBar, Modal, FormField, Btn, StatusBadge } from '../components/UI';

const EMPTY = { klok_freq: '', socket: '', product: '', aantal_cores: '', tdp: '', in_gebruik: '', notities: '' };
const GEBRUIK_OPTIONS = ['Ja', 'Nee'];

export default function CpuPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => api.get('/api/cpu').then(setItems);
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    [i.product, i.socket, i.klok_freq, i.tdp].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (item) => { setForm({ ...item }); setError(''); setModal(item); };
  const closeModal = () => setModal(null);
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (modal === 'add') await api.post('/api/cpu', form);
      else await api.put(`/api/cpu/${modal.id}`, form);
      await load();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Opslaan mislukt');
    }
  };

  const handleDelete = async (id) => { await api.delete(`/api/cpu/${id}`); await load(); };

  const COLS = [
    { key: 'product', label: 'Product' },
    { key: 'klok_freq', label: 'Kloksnelheid', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{v || '—'}</span> },
    { key: 'socket', label: 'Socket', render: v => <span className="badge badge-blue">{v || '—'}</span> },
    { key: 'aantal_cores', label: 'Kernen' },
    { key: 'tdp', label: 'TDP' },
    { key: 'in_gebruik', label: 'In gebruik', render: v => <StatusBadge value={v} /> },
  ];

  return (
    <div style={{ padding: '40px 40px' }}>
      <PageHeader title="CPU" subtitle={`${filtered.length} processors`} onAdd={openAdd} />
      <SearchBar value={search} onChange={setSearch} placeholder="Zoek op product, socket..." />
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6 }}>
        <Table columns={COLS} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'CPU TOEVOEGEN' : 'CPU BEWERKEN'} onClose={closeModal}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Product" name="product" value={form.product} onChange={handleChange} />
            <FormField label="Socket" name="socket" value={form.socket} onChange={handleChange} />
            <FormField label="Kloksnelheid" name="klok_freq" value={form.klok_freq} onChange={handleChange} />
            <FormField label="Aantal Kernen" name="aantal_cores" value={form.aantal_cores} onChange={handleChange} />
            <FormField label="TDP" name="tdp" value={form.tdp} onChange={handleChange} />
            <FormField label="In Gebruik?" name="in_gebruik" value={form.in_gebruik} onChange={handleChange} options={GEBRUIK_OPTIONS} />
          </div>
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
