import React, { useEffect, useState } from 'react';
import api from '../api';
import { Btn, Modal } from '../components/UI';

const TABLE_META = {
  macs:               { label: 'Macs',               icon: '⌘' },
  geheugen:           { label: 'Geheugen',            icon: '▤' },
  videokaarten:       { label: 'Videokaarten',        icon: '▣' },
  harde_schijven:     { label: 'Harde Schijven',      icon: '◉' },
  cpu:                { label: 'CPU',                  icon: '◈' },
  custom_categories:  { label: 'Eigen Categorieën',   icon: '◆' },
  custom_items:       { label: 'Eigen Items',          icon: '◆' },
};

function itemSummary(table, data) {
  switch (table) {
    case 'macs':            return [data.model_identifier, data.jaar].filter(Boolean).join(' — ') || '—';
    case 'geheugen':        return [data.merk, data.grootte, data.soort].filter(Boolean).join(' ') || '—';
    case 'videokaarten':    return [data.merk, data.model].filter(Boolean).join(' ') || '—';
    case 'harde_schijven':  return [data.merk, data.model, data.opslaggrootte].filter(Boolean).join(' ') || '—';
    case 'cpu':             return [data.product, data.klok_freq].filter(Boolean).join(' ') || '—';
    case 'custom_categories': return data.name || '—';
    case 'custom_items':    return `Item in categorie "${data.category_slug || '—'}"`;
    default:                return JSON.stringify(data).slice(0, 80);
  }
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TrashPage() {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [busy, setBusy]               = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/trash')
      .then(data => setItems(data))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const restore = async (id) => {
    setBusy(true);
    try { await api.post(`/api/trash/${id}/restore`); await load(); }
    finally { setBusy(false); }
  };

  const deletePermanent = async (id) => {
    setBusy(true);
    try { await api.delete(`/api/trash/${id}`); await load(); }
    finally { setBusy(false); }
  };

  const emptyTrash = async () => {
    setBusy(true);
    try { await api.delete('/api/trash/empty'); setConfirmEmpty(false); await load(); }
    finally { setBusy(false); }
  };

  // Groepeer per tabel
  const grouped = items.reduce((acc, item) => {
    (acc[item.table_name] = acc[item.table_name] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="page">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--text)', fontWeight: 600, letterSpacing: 1 }}>
            PRULLENBAK
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
            {loading ? 'Laden...' : `${items.length} verwijderd item${items.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {items.length > 0 && (
          <Btn variant="danger" onClick={() => setConfirmEmpty(true)}>🗑 Alles permanent verwijderen</Btn>
        )}
      </div>

      {/* Leeg */}
      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🗑</div>
          <div style={{ fontSize: 14, letterSpacing: 1 }}>PRULLENBAK IS LEEG</div>
          <div style={{ fontSize: 12, marginTop: 8, color: 'var(--text3)' }}>Verwijderde items verschijnen hier</div>
        </div>
      )}

      {/* Groepen */}
      {Object.entries(grouped).map(([tableName, rows]) => {
        const meta = TABLE_META[tableName] || { label: tableName, icon: '◆' };
        return (
          <div key={tableName} style={{ marginBottom: 32 }}>
            {/* Groep header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--accent)' }}>{meta.icon}</span>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase' }}>
                {meta.label}
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>({rows.length})</span>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
              {rows.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '13px 18px',
                    borderBottom: idx < rows.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {itemSummary(item.table_name, item.item_data)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                      Verwijderd op {formatDate(item.deleted_at)}
                    </div>
                  </div>

                  {/* Acties */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Btn small variant="secondary" onClick={() => restore(item.id)} style={{ opacity: busy ? 0.5 : 1 }}>
                      ↩ Herstellen
                    </Btn>
                    <Btn small variant="danger" onClick={() => deletePermanent(item.id)} style={{ opacity: busy ? 0.5 : 1 }}>
                      ✕ Permanent
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Bevestig leegmaken */}
      {confirmEmpty && (
        <Modal title="PRULLENBAK LEEGMAKEN" onClose={() => setConfirmEmpty(false)}>
          <p style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
            Weet je zeker dat je alle <strong style={{ color: 'var(--text)' }}>{items.length} items</strong> permanent wilt verwijderen?
            <br />Dit kan <strong style={{ color: 'var(--red)' }}>niet</strong> ongedaan worden gemaakt.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setConfirmEmpty(false)}>Annuleren</Btn>
            <Btn variant="danger" onClick={emptyTrash}>Ja, alles verwijderen</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
