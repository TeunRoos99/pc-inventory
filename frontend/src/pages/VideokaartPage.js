import React, { useEffect, useState } from 'react';
import api from '../api';
import { Table, PageHeader, SearchBar, Modal, FormField, Btn, StatusBadge } from '../components/UI';

const EMPTY = { merk: '', model: '', geheugen: '', werkt: '', flash: '', marktplaats_waarde: '', pulled_from: '', in_gebruik: '', notities: '' };
const WERKT_OPTIONS = ['Werkt', 'Niet werkend', 'Onbekend'];
const JN_OPTIONS = ['Ja', 'Nee'];

export default function VideokaartPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => api.get('/api/videokaarten').then(setItems);
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    [i.merk, i.model, i.geheugen, i.werkt, i.pulled_from, i.in_gebruik].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (item) => { setForm({ ...item }); setError(''); setModal(item); };
  const closeModal = () => setModal(null);
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (modal === 'add') await api.post('/api/videokaarten', form);
      else await api.put(`/api/videokaarten/${modal.id}`, form);
      await load();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Opslaan mislukt');
    }
  };

  const handleDelete = async (id) => { await api.delete(`/api/videokaarten/${id}`); await load(); };

  const COLS = [
    { key: 'merk', label: 'Merk' },
    { key: 'model', label: 'Model' },
    { key: 'geheugen', label: 'VRAM' },
    { key: 'werkt', label: 'Status', render: v => <StatusBadge value={v} /> },
    { key: 'flash', label: 'Flash', render: v => <StatusBadge value={v} /> },
    { key: 'marktplaats_waarde', label: 'Waarde (€)' },
    { key: 'pulled_from', label: 'Uit systeem' },
    { key: 'in_gebruik', label: 'In gebruik', render: v => <StatusBadge value={v} /> },
  ];

  return (
    <div style={{ padding: '40px 40px' }}>
      <PageHeader title="VIDEOKAARTEN" subtitle={`${filtered.length} kaarten`} onAdd={openAdd} />
      <SearchBar value={search} onChange={setSearch} placeholder="Zoek op merk, model, systeem..." />
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6 }}>
        <Table columns={COLS} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'VIDEOKAART TOEVOEGEN' : 'VIDEOKAART BEWERKEN'} onClose={closeModal}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Merk" name="merk" value={form.merk} onChange={handleChange} />
            <FormField label="Model" name="model" value={form.model} onChange={handleChange} />
            <FormField label="Geheugen (VRAM)" name="geheugen" value={form.geheugen} onChange={handleChange} />
            <FormField label="Marktplaats Waarde" name="marktplaats_waarde" value={form.marktplaats_waarde} onChange={handleChange} />
            <FormField label="Werkt?" name="werkt" value={form.werkt} onChange={handleChange} options={WERKT_OPTIONS} />
            <FormField label="Flash?" name="flash" value={form.flash} onChange={handleChange} options={JN_OPTIONS} />
            <FormField label="Uit systeem (pulled from)" name="pulled_from" value={form.pulled_from} onChange={handleChange} />
            <FormField label="In gebruik?" name="in_gebruik" value={form.in_gebruik} onChange={handleChange} options={JN_OPTIONS} />
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
