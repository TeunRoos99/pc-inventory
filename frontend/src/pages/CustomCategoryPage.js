import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useSettings } from '../context/SettingsContext';
import { Table, PageHeader, SearchBar, Modal, FormField, Btn } from '../components/UI';

export default function CustomCategoryPage() {
  const { slug } = useParams();
  const { customCategories } = useSettings();
  const navigate = useNavigate();

  const category = useMemo(() => customCategories.find(c => c.slug === slug), [customCategories, slug]);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api.get(`/api/custom-categories/${slug}/items`);
      setItems(data);
    } catch {}
  };

  useEffect(() => { if (slug) load(); }, [slug]);

  if (!category) {
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>Categorie niet gevonden.</p>
        <Btn variant="secondary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>← Terug</Btn>
      </div>
    );
  }

  const columns = category.columns || [];

  const filtered = items.filter(item =>
    columns.some(col => String(item[col.key] ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => {
    const empty = {};
    columns.forEach(c => { empty[c.key] = ''; });
    setForm(empty);
    setError('');
    setModal('add');
  };

  const openEdit = (item) => {
    const f = {};
    columns.forEach(c => { f[c.key] = item[c.key] ?? ''; });
    setForm(f);
    setError('');
    setModal(item);
  };

  const closeModal = () => setModal(null);
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (modal === 'add') await api.post(`/api/custom-categories/${slug}/items`, form);
      else await api.put(`/api/custom-categories/${slug}/items/${modal.id}`, form);
      await load();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Opslaan mislukt');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/custom-categories/${slug}/items/${id}`);
    await load();
  };

  const tableCols = columns.map(col => ({ key: col.key, label: col.label }));

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 24, color: category.color }}>{category.icon}</span>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--text)', fontWeight: 600, letterSpacing: 1 }}>
          {category.name.toUpperCase()}
        </h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>{filtered.length} items</p>
        <Btn onClick={openAdd}>+ TOEVOEGEN</Btn>
      </div>

      {columns.length === 0 && (
        <div style={{ padding: 24, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}>
            Deze categorie heeft nog geen kolommen.
          </p>
          <Btn variant="secondary" onClick={() => navigate('/instellingen')}>⚙ Kolommen instellen</Btn>
        </div>
      )}

      {columns.length > 0 && (
        <>
          <SearchBar value={search} onChange={setSearch} placeholder={`Zoek in ${category.name}...`} />
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <Table columns={tableCols} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
          </div>
        </>
      )}

      {modal && (
        <Modal title={modal === 'add' ? `${category.name.toUpperCase()} TOEVOEGEN` : `${category.name.toUpperCase()} BEWERKEN`} onClose={closeModal}>
          <div style={{ display: 'grid', gridTemplateColumns: columns.length > 4 ? '1fr 1fr' : '1fr', gap: '0 16px' }}>
            {columns.map(col => (
              <FormField key={col.key} label={col.label} name={col.key} value={form[col.key]} onChange={handleChange} />
            ))}
          </div>
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
