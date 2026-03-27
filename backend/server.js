const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pc-inventory-secret-change-in-production-2024';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'inventory.db');

// Zorg dat de data-map bestaat (voor Docker volume)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));

const db = new Database(DB_PATH);
db.exec(`
  PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS user_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE NOT NULL, theme TEXT DEFAULT 'dark', FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS macs (id INTEGER PRIMARY KEY AUTOINCREMENT, nummer INTEGER, model_identifier TEXT, jaar TEXT, schermgrootte TEXT, geheugen TEXT, opslag TEXT, processor TEXT, videokaart TEXT, notities TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS mac_upgrades (id INTEGER PRIMARY KEY AUTOINCREMENT, model_identifier TEXT UNIQUE NOT NULL, max_geheugen TEXT, opslag_type TEXT, notities TEXT);
  CREATE TABLE IF NOT EXISTS geheugen (id INTEGER PRIMARY KEY AUTOINCREMENT, formfactor TEXT, soort TEXT, merk TEXT, aantal INTEGER, grootte TEXT, snelheid TEXT, productcode TEXT, werking TEXT, marktplaats_waarde TEXT, in_gebruik TEXT, notities TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS videokaarten (id INTEGER PRIMARY KEY AUTOINCREMENT, merk TEXT, model TEXT, geheugen TEXT, werkt TEXT, flash TEXT, marktplaats_waarde TEXT, pulled_from TEXT, in_gebruik TEXT, notities TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS harde_schijven (id INTEGER PRIMARY KEY AUTOINCREMENT, nummer INTEGER, merk TEXT, model TEXT, serienummer TEXT, snelheid TEXT, formaat TEXT, opslaggrootte TEXT, vrije_ruimte TEXT, leeg TEXT, gebruik TEXT, notities TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS cpu (id INTEGER PRIMARY KEY AUTOINCREMENT, klok_freq TEXT, socket TEXT, product TEXT, aantal_cores TEXT, tdp TEXT, in_gebruik TEXT, notities TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS custom_categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, icon TEXT DEFAULT '◆', color TEXT DEFAULT '#00e5ff', columns_json TEXT NOT NULL DEFAULT '[]', created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id));
  CREATE TABLE IF NOT EXISTS custom_items (id INTEGER PRIMARY KEY AUTOINCREMENT, category_slug TEXT NOT NULL, data_json TEXT NOT NULL DEFAULT '{}', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_slug) REFERENCES custom_categories(slug) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS trash (id INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, item_id INTEGER NOT NULL, item_data TEXT NOT NULL, deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP);
`);

function seedData() {
  if (db.prepare('SELECT COUNT(*) as c FROM macs').get().c === 0) {
    db.prepare('INSERT INTO macs (nummer,model_identifier,jaar,schermgrootte,geheugen,opslag,processor,videokaart) VALUES (?,?,?,?,?,?,?,?)').run(1,'iMac7,1','Mid 2007','20 inch','4GB','500GB HDD','2,4 GHz Intel Core 2 Duo','ATI Radeon HD 2600 Pro 256 MB');
    const iu = db.prepare('INSERT OR IGNORE INTO mac_upgrades (model_identifier,max_geheugen,opslag_type) VALUES (?,?,?)');
    [['iMac4,1','667 MHz DDR2; 2GB (2)','3.5"'],['iMac4,2','667 MHz DDR2; 2GB (2)','3.5"'],['iMac5,1','667 MHz DDR2; 2GB (2)','3.5"'],['iMac5,2','667 MHz DDR2; 2GB (2)','3.5"'],['iMac6,1','667 MHz DDR2; 3GB (2)','3.5"'],['iMac7,1','667 MHz DDR2; 6GB (2)','3.5"'],['iMac8,1','800 MHz DDR2; 6GB (2)','3.5"'],['iMac9,1','1066 MHz DDR3 8GB (2)','3.5"'],['iMac10,1','1066 MHz DDR3 16GB (4)','3.5"'],['iMac11,1','1066 MHz DDR3 32GB (4)','3.5"'],['iMac11,2','1066 MHz DDR3 16GB (4)','3.5"'],['iMac11,3','1066 MHz DDR3 32GB (4)','3.5"'],['iMac12,1','1066 MHz DDR3 32GB (4)','3.5"'],['iMac12,2','1066 MHz DDR3 32GB (4)','3.5"']].forEach(r=>iu.run(...r));
  }
  if (db.prepare('SELECT COUNT(*) as c FROM geheugen').get().c === 0) {
    const ig = db.prepare('INSERT INTO geheugen (formfactor,soort,merk,aantal,grootte,snelheid,productcode,werking,marktplaats_waarde,in_gebruik) VALUES (?,?,?,?,?,?,?,?,?,?)');
    [['DIMM','DDR?','Transcend',1,'512MB','125MHz',null,'Onbekend',null,'Nee'],['DIMM','DDR','Kingston',1,'1GB','333MHz','KTA-G4333/1G','Onbekend',null,'Nee'],['DIMM','DDR?','Apple / Micron',1,'256MB','100MHz','MT16LSDT3264AG-10EB1','Onbekend',null,'Nee'],['DIMM','DDR2','Corsair',1,'2GB','800MHz','VS2GB800D2','Onbekend',null,'Nee'],['DIMM','DDR2','Spectek',2,'1GB','533MHz','PD128M6416U27YD2F-37E','Onbekend',null,'Nee'],['DIMM','DDR2','Kingston',2,'1GB','666MHz','KCM633-ELC','Onbekend',null,'Nee'],['DIMM','DDR3 ECC','Samsung',4,'8GB','1066MHz','0x4D33393342314B37304248312D4348392020','Werkt','8','MP5,1'],['DIMM','DDR3','Hynix',1,'4GB','1600MHz','HMT351U6CFR8C','Onbekend',null,'Nee'],['DIMM','DDR2','Nanya',2,'2GB','800MHz','NT2GT64U8HD0BY-AD','Onbekend',null,'Nee'],['DIMM','DDR3','Hynix',4,'2GB','1333MHz','HMT125U7TFR8C','Werkt',null,'Nee'],['DIMM','DDR2','Micron',1,'2GB','800MHz','MT16HTF25664HY-800J1','Onbekend',null,'Nee'],['SODIMM','DDR2','Corsair',2,'2GB','667MHz','VS2GSD667SD2','Werkt','10','Nee'],['SODIMM','DDR4','Samsung',2,'2GB','2400MHz','M471A5244CB0-CRC','Werkt','€ 20 - € 30','Nee'],['SODIMM','DDR3','Samsung',2,'2GB','1066MHz','M471B5673EH1-CF8','Werkt','10','Nee'],['SODIMM','DDR2','Kingston',2,'2GB','667MHz','KTA-MB667K2/4G','Werkt',null,'Nee'],['SODIMM','DDR3','Samsung',1,'4GB','1600MHz','M471B5273EB0-CK0','Werkt',null,'Nee']].forEach(r=>ig.run(...r));
  }
  if (db.prepare('SELECT COUNT(*) as c FROM videokaarten').get().c === 0) {
    const iv = db.prepare('INSERT INTO videokaarten (merk,model,geheugen,werkt,flash,marktplaats_waarde,pulled_from,in_gebruik) VALUES (?,?,?,?,?,?,?,?)');
    [['XFX','Radeon HD7950','3GB','Niet werkend','Ja','10','-','-'],['NVIDIA','GTX760','2GB','Werkt','Nee','50','Game PC','-'],['Apple','6600LE','256MB','Onbekend','Ja',null,'Powermac G5','-'],['ATI','Radeon 4870','512MB','Werkt','Ja','20','MP5,1','-'],['AMD','RX580','8GB','Werkt','Nee','150','-','MP5,1']].forEach(r=>iv.run(...r));
  }
  if (db.prepare('SELECT COUNT(*) as c FROM harde_schijven').get().c === 0) {
    const ih = db.prepare('INSERT INTO harde_schijven (nummer,merk,model,serienummer,snelheid,formaat,opslaggrootte,vrije_ruimte,leeg,gebruik) VALUES (?,?,?,?,?,?,?,?,?,?)');
    [[8,'Toshiba','MK2555GSX','8994COUVT','DOOD','DOOD','DOOD','DOOD','Nee','DOOD'],[9,'HGST','0J47783','180610JR1000BNJ4H9AE','DOOD','DOOD','DOOD','DOOD','Nee',''],[19,'Western Digital','WD2000F9YZ','WCC5C0014320','7200RPM','3.5"','2000GB','2000','Nee','Time Machine Truenas'],[18,'Western Digital','WD20EARS','WCAZA2207444','7200RPM','3.5"','2000GB','2000','Nee','HTPC Games'],[12,'Seagate','Barracuda 7200.10','5VP7YSWD','7200RPM','3.5"','1000GB','1000','Nee','-'],[6,'Western Digital','WD5000AAKS','WMASY0948055','7200RPM','3.5"','500GB','500','Nee','DOOD'],[3,'Western Digital','WD20EADS','WCAVY1619567','5400RPM','3.5"','2000GB','0','Nee','NextCloud backup'],[5,'Seagate','Barracuda 7200.10','9RWA6A3BY','7200RPM','3.5"','80GB','0','Nee','uit elkaar gehaald'],[10,'Fujitsu','MJA2320BH','K94ET9827T59','5400RPM','2.5"','320GB','0','Nee','Installs'],[11,'HGST','5K1000-1000','BV0ZP4US','5400RPM','2.5"','1000GB','0','Nee','TM-BU'],[14,'Samsung','850 EVO','S21JNXAGC26807W',null,'2.5"','500GB','0','Nee','PS4'],[24,'Samsung','840 EVO','S1D5NSBF579593F',null,'2.5"','120GB','0','Nee','Windows server installatie'],[25,'Maxtor','DiamondMax 20','6PT2ASEW','7200RPM','3.5"','160GB','0','Nee','Nico schijf'],[26,'Hitachi','H2T500854S','12047J2360051E47YYC','5400RPM','2.5"','500GB','0','Nee','Fieke schijf'],[2,'Hitachi','HDS7210KLA330',null,'7200RPM','3.5"','1000GB','1000','Ja','Oud, liever niet gebruiken'],[15,'Toshiba','MQ04ABF001C','X72SPI2IZT','5400RPM','2.5"','1000GB','1000','Ja','-'],[20,'Western Digital','WD10EZEX','WCC6Y4JAXSP6','7200RPM','3.5"','1000GB','1000','Ja','Maakt veel geluid, werkt goed.'],[21,'Hitachi','HDS7210KLA330','PAGYKS4H','7200RPM','3.5"','1000GB','1000','Ja','Oud, liever niet gebruiken'],[1,'Western Digital','WD5000AAKS','WCC2EC357676','7200RPM','3.5"','500GB','500','Nee','Fotos Truenas'],[4,'Western Digital','WD5000AAKS','WMASY0939911','7200RPM','3.5"','500GB','500','Ja','-'],[7,'Seagate','Barracuda','9QG9JDEQ','7200RPM','3.5"','500GB','500','Ja','-'],[13,'Seagate','Barracuda 7200.10','Z2AJK70A','7200RPM','3.5"','500GB','500','Ja','-'],[16,'HGST','Z5K500-500','141204TM85A3TC26GGL','5400RPM','2.5"','500GB','500','Ja','-'],[22,'Seagate','ST500LT012','S3PYNT2R','5400RPM','2.5"','500GB','500','Ja','-'],[17,'Hitachi','HTS545025B9A300','090930PB42011SG5KRZG','5400RPM','2.5"','250GB','250','Ja','-'],[23,'Hitachi','5K500.B',null,'5400RPM','2.5"','160GB','160','Ja',null]].forEach(r=>ih.run(...r));
  }
  if (db.prepare('SELECT COUNT(*) as c FROM cpu').get().c === 0)
    db.prepare('INSERT INTO cpu (klok_freq,socket,product,aantal_cores,tdp,in_gebruik) VALUES (?,?,?,?,?,?)').run('2.80 GHz','LGA1366','Intel W3530','8','130W','Nee');
}
seedData();

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Geen token' });
  try { req.user = jwt.verify(header.split(' ')[1], JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Ongeldig token' }); }
}

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Gebruikersnaam en wachtwoord verplicht' });
  if (password.length < 6) return res.status(400).json({ error: 'Wachtwoord minimaal 6 tekens' });
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) return res.status(409).json({ error: 'Gebruikersnaam al in gebruik' });
  const hash = bcrypt.hashSync(password, 12);
  const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
  db.prepare('INSERT OR IGNORE INTO user_settings (user_id, theme) VALUES (?, ?)').run(result.lastInsertRowid, 'dark');
  res.json({ token: jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' }), username });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { username, reset_token, new_password } = req.body;
  const configured = process.env.RESET_TOKEN;
  if (!configured) return res.status(503).json({ error: 'Reset niet ingeschakeld. Stel RESET_TOKEN in als omgevingsvariabele.' });
  if (!reset_token || reset_token !== configured) return res.status(401).json({ error: 'Reset-code onjuist' });
  if (!new_password || new_password.length < 6) return res.status(400).json({ error: 'Wachtwoord minimaal 6 tekens' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(404).json({ error: 'Gebruiker niet gevonden' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 12), user.id);
  res.json({ success: true });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Ongeldige inloggegevens' });
  db.prepare('INSERT OR IGNORE INTO user_settings (user_id, theme) VALUES (?, ?)').run(user.id, 'dark');
  res.json({ token: jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' }), username: user.username });
});

app.get('/api/settings', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id) || { theme: 'dark' });
});
app.put('/api/settings', auth, (req, res) => {
  const { theme } = req.body;
  db.prepare('INSERT INTO user_settings (user_id, theme) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET theme = excluded.theme').run(req.user.id, theme || 'dark');
  res.json({ theme });
});
app.put('/api/settings/password', auth, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!new_password || new_password.length < 6) return res.status(400).json({ error: 'Nieuw wachtwoord minimaal 6 tekens' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password_hash)) return res.status(401).json({ error: 'Huidig wachtwoord onjuist' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 12), req.user.id);
  res.json({ success: true });
});

// ── Export ──────────────────────────────────────────────────────────────────
app.get('/api/export', auth, (req, res) => {
  const data = {
    version: 1,
    exported_at: new Date().toISOString(),
    macs: db.prepare('SELECT * FROM macs').all(),
    mac_upgrades: db.prepare('SELECT * FROM mac_upgrades').all(),
    geheugen: db.prepare('SELECT * FROM geheugen').all(),
    videokaarten: db.prepare('SELECT * FROM videokaarten').all(),
    harde_schijven: db.prepare('SELECT * FROM harde_schijven').all(),
    cpu: db.prepare('SELECT * FROM cpu').all(),
    custom_categories: db.prepare('SELECT * FROM custom_categories').all(),
    custom_items: db.prepare('SELECT * FROM custom_items').all(),
  };
  res.setHeader('Content-Disposition', `attachment; filename="inventory-export-${new Date().toISOString().slice(0,10)}.json"`);
  res.json(data);
});

// ── Import ──────────────────────────────────────────────────────────────────
app.post('/api/import', auth, (req, res) => {
  const data = req.body;
  if (!data || !data.version) return res.status(400).json({ error: 'Ongeldig exportbestand' });

  let added = 0, skipped = 0;

  const importRows = (table, rows, cols) => {
    if (!Array.isArray(rows)) return;
    const stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`);
    rows.forEach(row => {
      try {
        const result = stmt.run(...cols.map(c => row[c] ?? null));
        result.changes > 0 ? added++ : skipped++;
      } catch { skipped++; }
    });
  };

  importRows('macs', data.macs, ['id','nummer','model_identifier','jaar','schermgrootte','geheugen','opslag','processor','videokaart','notities','created_at','updated_at']);
  importRows('mac_upgrades', data.mac_upgrades, ['id','model_identifier','max_geheugen','opslag_type','notities']);
  importRows('geheugen', data.geheugen, ['id','formfactor','soort','merk','aantal','grootte','snelheid','productcode','werking','marktplaats_waarde','in_gebruik','notities','created_at','updated_at']);
  importRows('videokaarten', data.videokaarten, ['id','merk','model','geheugen','werkt','flash','marktplaats_waarde','pulled_from','in_gebruik','notities','created_at','updated_at']);
  importRows('harde_schijven', data.harde_schijven, ['id','nummer','merk','model','serienummer','snelheid','formaat','opslaggrootte','vrije_ruimte','leeg','gebruik','notities','created_at','updated_at']);
  importRows('cpu', data.cpu, ['id','klok_freq','socket','product','aantal_cores','tdp','in_gebruik','notities','created_at','updated_at']);
  importRows('custom_categories', data.custom_categories, ['id','name','slug','icon','color','columns_json','created_by','created_at']);
  importRows('custom_items', data.custom_items, ['id','category_slug','data_json','created_at','updated_at']);

  res.json({ success: true, added, skipped });
});

app.get('/api/custom-categories', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM custom_categories ORDER BY created_at ASC').all().map(c => ({ ...c, columns: JSON.parse(c.columns_json) })));
});
app.post('/api/custom-categories', auth, (req, res) => {
  const { name, icon, color, columns } = req.body;
  if (!name) return res.status(400).json({ error: 'Naam verplicht' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
  const result = db.prepare('INSERT INTO custom_categories (name, slug, icon, color, columns_json, created_by) VALUES (?,?,?,?,?,?)').run(name, slug, icon || '◆', color || '#00e5ff', JSON.stringify(columns || []), req.user.id);
  const cat = db.prepare('SELECT * FROM custom_categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...cat, columns: JSON.parse(cat.columns_json) });
});
app.put('/api/custom-categories/:id', auth, (req, res) => {
  const { name, icon, color, columns } = req.body;
  const cat = db.prepare('SELECT * FROM custom_categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Niet gevonden' });
  db.prepare('UPDATE custom_categories SET name=?, icon=?, color=?, columns_json=? WHERE id=?').run(name || cat.name, icon || cat.icon, color || cat.color, JSON.stringify(columns || JSON.parse(cat.columns_json)), req.params.id);
  const u = db.prepare('SELECT * FROM custom_categories WHERE id = ?').get(req.params.id);
  res.json({ ...u, columns: JSON.parse(u.columns_json) });
});
app.delete('/api/custom-categories/:id', auth, (req, res) => {
  const cat = db.prepare('SELECT * FROM custom_categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Niet gevonden' });
  const trashStmt = db.prepare('INSERT INTO trash (table_name, item_id, item_data) VALUES (?, ?, ?)');
  db.prepare('SELECT * FROM custom_items WHERE category_slug = ?').all(cat.slug).forEach(item =>
    trashStmt.run('custom_items', item.id, JSON.stringify(item))
  );
  db.prepare('DELETE FROM custom_items WHERE category_slug = ?').run(cat.slug);
  trashStmt.run('custom_categories', cat.id, JSON.stringify(cat));
  db.prepare('DELETE FROM custom_categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/custom-categories/:slug/items', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM custom_items WHERE category_slug = ? ORDER BY id DESC').all(req.params.slug).map(i => ({ id: i.id, ...JSON.parse(i.data_json), created_at: i.created_at, updated_at: i.updated_at })));
});
app.post('/api/custom-categories/:slug/items', auth, (req, res) => {
  if (!db.prepare('SELECT id FROM custom_categories WHERE slug = ?').get(req.params.slug)) return res.status(404).json({ error: 'Categorie niet gevonden' });
  const result = db.prepare('INSERT INTO custom_items (category_slug, data_json) VALUES (?, ?)').run(req.params.slug, JSON.stringify(req.body));
  const row = db.prepare('SELECT * FROM custom_items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ id: row.id, ...JSON.parse(row.data_json), created_at: row.created_at, updated_at: row.updated_at });
});
app.put('/api/custom-categories/:slug/items/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM custom_items WHERE id = ? AND category_slug = ?').get(req.params.id, req.params.slug);
  if (!row) return res.status(404).json({ error: 'Niet gevonden' });
  db.prepare('UPDATE custom_items SET data_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(req.body), req.params.id);
  const u = db.prepare('SELECT * FROM custom_items WHERE id = ?').get(req.params.id);
  res.json({ id: u.id, ...JSON.parse(u.data_json), created_at: u.created_at, updated_at: u.updated_at });
});
app.delete('/api/custom-categories/:slug/items/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM custom_items WHERE id = ? AND category_slug = ?').get(req.params.id, req.params.slug);
  if (!row) return res.status(404).json({ error: 'Niet gevonden' });
  db.prepare('INSERT INTO trash (table_name, item_id, item_data) VALUES (?, ?, ?)').run('custom_items', row.id, JSON.stringify(row));
  db.prepare('DELETE FROM custom_items WHERE id = ? AND category_slug = ?').run(req.params.id, req.params.slug);
  res.json({ success: true });
});

function crudRoutes(table, fields) {
  const router = express.Router();
  router.get('/', auth, (req, res) => res.json(db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all()));
  router.get('/:id', auth, (req, res) => { const r = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id); r ? res.json(r) : res.status(404).json({ error: 'Niet gevonden' }); });
  router.post('/', auth, (req, res) => { const vals = fields.map(f => req.body[f] ?? null); const result = db.prepare(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`).run(...vals); res.status(201).json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid)); });
  router.put('/:id', auth, (req, res) => { const ex = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id); if (!ex) return res.status(404).json({ error: 'Niet gevonden' }); const vals = fields.map(f => req.body[f] ?? ex[f]); const extra = table === 'mac_upgrades' ? '' : ', updated_at = CURRENT_TIMESTAMP'; db.prepare(`UPDATE ${table} SET ${fields.map(f => `${f} = ?`).join(', ')}${extra} WHERE id = ?`).run(...vals, req.params.id); res.json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id)); });
  router.delete('/:id', auth, (req, res) => { const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id); if (!existing) return res.status(404).json({ error: 'Niet gevonden' }); db.prepare('INSERT INTO trash (table_name, item_id, item_data) VALUES (?, ?, ?)').run(table, existing.id, JSON.stringify(existing)); db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id); res.json({ success: true }); });
  return router;
}

app.use('/api/macs', crudRoutes('macs', ['nummer','model_identifier','jaar','schermgrootte','geheugen','opslag','processor','videokaart','notities']));
app.use('/api/mac-upgrades', crudRoutes('mac_upgrades', ['model_identifier','max_geheugen','opslag_type','notities']));
app.use('/api/geheugen', crudRoutes('geheugen', ['formfactor','soort','merk','aantal','grootte','snelheid','productcode','werking','marktplaats_waarde','in_gebruik','notities']));
app.use('/api/videokaarten', crudRoutes('videokaarten', ['merk','model','geheugen','werkt','flash','marktplaats_waarde','pulled_from','in_gebruik','notities']));
app.use('/api/harde-schijven', crudRoutes('harde_schijven', ['nummer','merk','model','serienummer','snelheid','formaat','opslaggrootte','vrije_ruimte','leeg','gebruik','notities']));
app.use('/api/cpu', crudRoutes('cpu', ['klok_freq','socket','product','aantal_cores','tdp','in_gebruik','notities']));

app.get('/api/stats', auth, (req, res) => {
  const fixed = { macs: db.prepare('SELECT COUNT(*) as c FROM macs').get().c, geheugen: db.prepare('SELECT COUNT(*) as c FROM geheugen').get().c, videokaarten: db.prepare('SELECT COUNT(*) as c FROM videokaarten').get().c, harde_schijven: db.prepare('SELECT COUNT(*) as c FROM harde_schijven').get().c, cpu: db.prepare('SELECT COUNT(*) as c FROM cpu').get().c };
  const custom = {};
  db.prepare('SELECT slug FROM custom_categories').all().forEach(r => { custom[r.slug] = db.prepare('SELECT COUNT(*) as c FROM custom_items WHERE category_slug = ?').get(r.slug).c; });
  res.json({ ...fixed, custom });
});

// ── Prullenbak ───────────────────────────────────────────────────────────────
app.get('/api/trash', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM trash ORDER BY deleted_at DESC').all().map(r => ({ ...r, item_data: JSON.parse(r.item_data) })));
});

app.post('/api/trash/:id/restore', auth, (req, res) => {
  const t = db.prepare('SELECT * FROM trash WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Niet gevonden in prullenbak' });
  const data = JSON.parse(t.item_data);
  const cols = Object.keys(data);
  try {
    db.prepare(`INSERT OR IGNORE INTO ${t.table_name} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map(c => data[c]));
    db.prepare('DELETE FROM trash WHERE id = ?').run(t.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Herstel mislukt: ' + e.message });
  }
});

app.delete('/api/trash/empty', auth, (req, res) => {
  db.prepare('DELETE FROM trash').run();
  res.json({ success: true });
});

app.delete('/api/trash/:id', auth, (req, res) => {
  if (db.prepare('DELETE FROM trash WHERE id = ?').run(req.params.id).changes === 0)
    return res.status(404).json({ error: 'Niet gevonden' });
  res.json({ success: true });
});

// Serve React frontend (in Docker / productie)
const buildPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

app.listen(PORT, () => console.log(`✅ Server draait op http://localhost:${PORT}`));
