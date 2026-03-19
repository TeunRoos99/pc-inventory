import React, { useState, useMemo } from 'react';
import useIsMobile from '../hooks/useIsMobile';

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide }) {
  const isMobile = useIsMobile();

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)',
  };

  const box = isMobile ? {
    background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: '12px 12px 0 0', padding: '20px 16px',
    width: '100%', maxHeight: '92dvh', overflowY: 'auto',
  } : {
    background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: 6, padding: 28,
    width: '100%', maxWidth: wide ? 720 : 560, maxHeight: '90vh', overflowY: 'auto',
    margin: '0 16px',
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={box}>
        {/* Drag-handle op mobiel */}
        {isMobile && (
          <div style={{ width: 40, height: 4, background: 'var(--border2)', borderRadius: 2, margin: '0 auto 16px' }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', letterSpacing: 1 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: 20, minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────
export function FormField({ label, name, value, onChange, type = 'text', options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>{label}</label>
      {options ? (
        <select name={name} value={value || ''} onChange={onChange}>
          <option value="">— selecteer —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} value={value || ''} onChange={onChange} rows={3} style={{ resize: 'vertical' }} />
      ) : (
        <input type={type} name={name} value={value || ''} onChange={onChange} />
      )}
    </div>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', small, style: extra = {}, type }) {
  const styles = {
    primary:   { background: 'var(--accent)', color: 'var(--bg)', fontWeight: 600 },
    secondary: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border2)' },
    danger:    { background: 'rgba(200,50,30,0.12)', color: 'var(--red)', border: '1px solid rgba(200,50,30,0.25)' },
    ghost:     { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' },
  };
  return (
    <button
      type={type} onClick={onClick}
      style={{
        padding: small ? '6px 12px' : '9px 18px',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-mono)', fontSize: small ? 11 : 12, letterSpacing: 0.5,
        cursor: 'pointer', transition: 'opacity 0.15s',
        minHeight: small ? 36 : 40, // touch-vriendelijk
        ...styles[variant], ...extra,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</button>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, onAdd }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--text)', fontWeight: 600, letterSpacing: 1 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {onAdd && <Btn onClick={onAdd}>+ TOEVOEGEN</Btn>}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ value }) {
  if (!value) return <span style={{ color: 'var(--text3)' }}>—</span>;
  const v = value.toLowerCase();
  if (v === 'werkt' || v === 'ja')              return <span className="badge badge-green">{value}</span>;
  if (v === 'niet werkend' || v === 'dood')     return <span className="badge badge-red">{value}</span>;
  if (v === 'onbekend')                         return <span className="badge badge-yellow">{value}</span>;
  if (v === 'nee' || v === '-')                 return <span className="badge badge-gray">{value}</span>;
  return <span className="badge badge-blue">{value}</span>;
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 12, position: 'relative' }}>
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 13 }}>⌕</span>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Zoeken...'}
        style={{ paddingLeft: 30 }}
      />
    </div>
  );
}

// ── ColumnFilter (intern) ─────────────────────────────────────────────────────
function ColumnFilter({ column, data, value, onChange }) {
  const uniqueValues = useMemo(() => {
    return [...new Set(data.map(r => r[column.key]).filter(v => v != null && v !== ''))].sort();
  }, [data, column.key]);

  if (uniqueValues.length === 0) return null;

  return (
    <div style={{ minWidth: 120 }}>
      <select
        value={value || ''}
        onChange={e => onChange(column.key, e.target.value || null)}
        style={{ fontSize: 13, padding: '6px 8px', fontFamily: 'var(--font-mono)' }}
      >
        <option value="">Alle</option>
        {uniqueValues.map(v => (
          <option key={v} value={v}>{String(v).length > 20 ? String(v).slice(0, 20) + '…' : v}</option>
        ))}
      </select>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ columns, data, onEdit, onDelete }) {
  const isMobile = useIsMobile();
  const [delConfirm, setDelConfirm] = useState(null);
  const [filters, setFilters]       = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey]       = useState(null);
  const [sortDir, setSortDir]       = useState('asc');

  const setFilter = (key, val) => setFilters(p => val == null ? (({ [key]: _, ...rest }) => rest)(p) : { ...p, [key]: val });
  const activeFilterCount = Object.keys(filters).length;

  const filtered = useMemo(() => {
    let rows = data;
    Object.entries(filters).forEach(([key, val]) => {
      if (val) rows = rows.filter(r => String(r[key] ?? '') === String(val));
    });
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, filters, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Filter toolbar (gedeeld tussen mobiel en desktop) ──
  const FilterToolbar = () => (
    <>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'var(--bg2)' }}>
        <button
          onClick={() => setShowFilters(s => !s)}
          style={{
            background: showFilters ? 'rgba(0,150,220,0.1)' : 'var(--bg3)',
            color: showFilters ? 'var(--accent)' : 'var(--text2)',
            border: `1px solid ${showFilters ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: 'var(--radius)', padding: '6px 12px', minHeight: 36,
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.5, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ▽ FILTERS {activeFilterCount > 0 && <span style={{ background: 'var(--accent)', color: 'var(--bg)', borderRadius: 10, padding: '0 6px', fontSize: 10 }}>{activeFilterCount}</span>}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={() => setFilters({})} style={{ background: 'transparent', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', minHeight: 36 }}>
            ✕ Wis
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
          {filtered.length} / {data.length}
        </span>
      </div>

      {showFilters && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {columns.map(col => (
            <div key={col.key}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>{col.label}</div>
              <ColumnFilter column={col} data={data} value={filters[col.key]} onChange={setFilter} />
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ── Mobiel: kaartweergave ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div>
        <FilterToolbar />
        {filtered.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            — geen items —
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filtered.map(row => (
            <div key={row.id} style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '14px 16px' }}>
              {/* Velden */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 12 }}>
                {columns.map(c => (
                  <div key={c.key}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text)', wordBreak: 'break-word' }}>
                      {c.render ? c.render(row[c.key], row) : (row[c.key] ?? <span style={{ color: 'var(--text3)' }}>—</span>)}
                    </div>
                  </div>
                ))}
              </div>
              {/* Acties */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <Btn small variant="ghost" onClick={() => onEdit(row)}>✎ Bewerken</Btn>
                {delConfirm === row.id ? (
                  <>
                    <Btn small variant="danger" onClick={() => { onDelete(row.id); setDelConfirm(null); }}>Ja</Btn>
                    <Btn small variant="secondary" onClick={() => setDelConfirm(null)}>Nee</Btn>
                  </>
                ) : (
                  <Btn small variant="danger" onClick={() => setDelConfirm(row.id)}>✕ Verwijder</Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Desktop: tabelweergave ─────────────────────────────────────────────────
  return (
    <div>
      <FilterToolbar />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map(c => (
                <th
                  key={c.key} onClick={() => handleSort(c.key)}
                  style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 11, color: sortKey === c.key ? 'var(--accent)' : 'var(--text3)', letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                >
                  {c.label} {sortKey === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>ACTIES</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={columns.length + 1} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>— geen items —</td></tr>
            )}
            {filtered.map(row => (
              <tr
                key={row.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(c => (
                  <td key={c.key} style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? <span style={{ color: 'var(--text3)' }}>—</span>)}
                  </td>
                ))}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Btn small variant="ghost" onClick={() => onEdit(row)}>✎</Btn>
                    {delConfirm === row.id ? (
                      <>
                        <Btn small variant="danger" onClick={() => { onDelete(row.id); setDelConfirm(null); }}>Ja</Btn>
                        <Btn small variant="secondary" onClick={() => setDelConfirm(null)}>Nee</Btn>
                      </>
                    ) : (
                      <Btn small variant="danger" onClick={() => setDelConfirm(row.id)}>✕</Btn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
