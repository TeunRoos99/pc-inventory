import React, { useEffect, useState } from 'react';
import api from '../api';
import { Table, PageHeader, SearchBar, Modal, FormField, Btn, StatusBadge } from '../components/UI';

const EMPTY = { nummer: '', model_identifier: '', jaar: '', schermgrootte: '', geheugen: '', opslag: '', processor: '', videokaart: '', notities: '' };

export default function MacsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | item
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => api.get('/api/macs').then(setItems);
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    [i.model_identifier, i.jaar, i.processor, i.videokaart, i.notities].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (item) => { setForm({ ...item }); setError(''); setModal(item); };
  const closeModal = () => setModal(null);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (modal === 'add') await api.post('/api/macs', form);
      else await api.put(`/api/macs/${modal.id}`, form);
      await load();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Opslaan mislukt');
    }
  };

  const handleDelete = async (id) => { await api.delete(`/api/macs/${id}`); await load(); };

  const COLS = [
    { key: 'nummer', label: '#' },
    { key: 'model_identifier', label: 'Model' },
    { key: 'jaar', label: 'Jaar' },
    { key: 'schermgrootte', label: 'Scherm' },
    { key: 'geheugen', label: 'RAM' },
    { key: 'opslag', label: 'Opslag' },
    { key: 'processor', label: 'Processor' },
    { key: 'videokaart', label: 'GPU' },
  ];

  return (
    <div style={{ padding: '40px 40px' }}>
      <PageHeader title="MACS" subtitle={`${filtered.length} systemen`} onAdd={openAdd} />
      <SearchBar value={search} onChange={setSearch} placeholder="Zoek op model, processor..." />
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6 }}>
        <Table columns={COLS} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'MAC TOEVOEGEN' : 'MAC BEWERKEN'} onClose={closeModal}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Nummer" name="nummer" value={form.nummer} onChange={handleChange} type="number" />
            <FormField label="Model Identifier" name="model_identifier" value={form.model_identifier} onChange={handleChange} />
            <FormField label="Jaar" name="jaar" value={form.jaar} onChange={handleChange} />
            <FormField label="Schermgrootte" name="schermgrootte" value={form.schermgrootte} onChange={handleChange} />
            <FormField label="Geheugen" name="geheugen" value={form.geheugen} onChange={handleChange} />
            <FormField label="Opslag" name="opslag" value={form.opslag} onChange={handleChange} />
          </div>
          <FormField label="Processor" name="processor" value={form.processor} onChange={handleChange} />
          <FormField label="Videokaart" name="videokaart" value={form.videokaart} onChange={handleChange} />
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
