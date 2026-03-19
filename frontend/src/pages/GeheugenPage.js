import React, { useEffect, useState } from 'react';
import api from '../api';
import { Table, PageHeader, SearchBar, Modal, FormField, Btn, StatusBadge } from '../components/UI';

const EMPTY = { formfactor: '', soort: '', merk: '', aantal: '', grootte: '', snelheid: '', productcode: '', werking: '', marktplaats_waarde: '', in_gebruik: '', notities: '' };
const FORMFACTOR_OPTIONS = ['DIMM', 'SODIMM'];
const SOORT_OPTIONS = ['DDR', 'DDR2', 'DDR3', 'DDR3 ECC', 'DDR4', 'DDR5', 'DDR?'];
const WERKING_OPTIONS = ['Werkt', 'Niet werkend', 'Onbekend'];
const GEBRUIK_OPTIONS = ['Ja', 'Nee'];

export default function GeheugenPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => api.get('/api/geheugen').then(setItems);
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    [i.formfactor, i.soort, i.merk, i.grootte, i.productcode, i.werking].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (item) => { setForm({ ...item }); setError(''); setModal(item); };
  const closeModal = () => setModal(null);
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (modal === 'add') await api.post('/api/geheugen', form);
      else await api.put(`/api/geheugen/${modal.id}`, form);
      await load();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Opslaan mislukt');
    }
  };

  const handleDelete = async (id) => { await api.delete(`/api/geheugen/${id}`); await load(); };

  const COLS = [
    { key: 'formfactor', label: 'Form Factor', render: v => <span className="badge badge-blue">{v || '—'}</span> },
    { key: 'soort', label: 'Soort' },
    { key: 'merk', label: 'Merk' },
    { key: 'aantal', label: 'Aantal' },
    { key: 'grootte', label: 'Grootte' },
    { key: 'snelheid', label: 'Snelheid' },
    { key: 'werking', label: 'Werking', render: v => <StatusBadge value={v} /> },
    { key: 'in_gebruik', label: 'In gebruik', render: v => <StatusBadge value={v} /> },
    { key: 'marktplaats_waarde', label: 'Waarde (€)' },
  ];

  return (
    <div style={{ padding: '40px 40px' }}>
      <PageHeader title="GEHEUGEN" subtitle={`${filtered.length} modules`} onAdd={openAdd} />
      <SearchBar value={search} onChange={setSearch} placeholder="Zoek op merk, soort, productcode..." />
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6 }}>
        <Table columns={COLS} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'GEHEUGEN TOEVOEGEN' : 'GEHEUGEN BEWERKEN'} onClose={closeModal}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Form Factor" name="formfactor" value={form.formfactor} onChange={handleChange} options={FORMFACTOR_OPTIONS} />
            <FormField label="Soort" name="soort" value={form.soort} onChange={handleChange} options={SOORT_OPTIONS} />
            <FormField label="Merk" name="merk" value={form.merk} onChange={handleChange} />
            <FormField label="Aantal" name="aantal" value={form.aantal} onChange={handleChange} type="number" />
            <FormField label="Grootte" name="grootte" value={form.grootte} onChange={handleChange} />
            <FormField label="Snelheid" name="snelheid" value={form.snelheid} onChange={handleChange} />
            <FormField label="Werking" name="werking" value={form.werking} onChange={handleChange} options={WERKING_OPTIONS} />
            <FormField label="In Gebruik" name="in_gebruik" value={form.in_gebruik} onChange={handleChange} options={GEBRUIK_OPTIONS} />
          </div>
          <FormField label="Productcode" name="productcode" value={form.productcode} onChange={handleChange} />
          <FormField label="Marktplaats Waarde" name="marktplaats_waarde" value={form.marktplaats_waarde} onChange={handleChange} />
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
