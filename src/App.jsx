import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const MORALIS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImVjZGNjZDhiLTVmYjAtNDExMC1iZWUxLTY2ZGNhODQwZjE2MyIsIm9yZ0lkIjoiNDc4Njc3IiwidXNlcklkIjoiNDkyNDY4IiwidHlwZUlkIjoiZmQ5Zjk4ZTUtZTc1Yy00Mjk0LWJkZjYtMmZiZTg0NjgzZmZiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njk4NjYwMTIsImV4cCI6NDkyNTYyNjAxMn0.StuCFBwn4_Wv32m2FeuCeuMzJPVVWlewCwE2VxnMzto';
const USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
const EUR_USD = 1.1855;
const ADMIN_PIN = '2024';
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTN35Qf_kApsWveC1A7blqmsYqTMbLqrbQk0rI7lgfKBtle3rWA6IcNc2VkFfqI106s_LO3zFne5Uga/pub?gid=0&single=true&output=csv';
const LOGO_SRC = 'https://drive.google.com/file/d/1Nv5iDeb8nk44OeKr0jRwhy0I4NHYWCfy/view?usp=drive_link';

const JSONBIN_BIN_ID  = '69b83cacb7ec241ddc73c5d7';
const JSONBIN_API_KEY = '$2a$10$MqO48GfuzCCzj5YTst9dke12Rfn/8eGIbO4SK/zbXs/.zzp6O8Nkm';
const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

async function loadSafesFromJSONBin() {
  try {
    const res = await fetch(JSONBIN_URL + '/latest', { headers: { 'X-Master-Key': JSONBIN_API_KEY } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (Array.isArray(data.record) && data.record.length > 0) return data.record;
    return null;
  } catch (e) { console.error('[JSONBin] Error:', e.message); return null; }
}

async function saveSafesToJSONBin(safes) {
  try {
    const res = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
      body: JSON.stringify(safes),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return true;
  } catch (e) { console.error('[JSONBin] Error guardando:', e.message); return false; }
}

const DEFAULT_SAFES = [
  { address: '0x7FB1e8a839B81C9Ae4CebAd6f259106d77eD83D2', name: 'CME-1' },
  { address: '0x17BF9A5bF74181AaB6CbB7EC80e16B7F1bFDF5a7', name: 'RET-2' },
  { address: '0x7590219fDAFcC4e48c8c4E9178722d916d7EE305', name: 'SLA-3' },
  { address: '0x8823eed2A3644edC49abd6628c777bFC3f4243F0', name: 'GRX-4' },
  { address: '0xba9759D878c0Ff656f1C1d9670F4736E162F61AF', name: 'LVT-2' },
];

const COLOR_PALETTE = ['#00d4aa','#818cf8','#fb923c','#f472b6','#34d399','#60a5fa','#fbbf24','#e879f9','#a3e635','#38bdf8','#f87171','#c084fc'];

const BUDGET_2026 = [
  { mes: 'Ene', label: 'Enero',      goal: 2500000 },
  { mes: 'Feb', label: 'Febrero',    goal: 3773000 },
  { mes: 'Mar', label: 'Marzo',      goal: 4045000 },
  { mes: 'Abr', label: 'Abril',      goal: 4318000 },
  { mes: 'May', label: 'Mayo',       goal: 4591000 },
  { mes: 'Jun', label: 'Junio',      goal: 4864000 },
  { mes: 'Jul', label: 'Julio',      goal: 5136000 },
  { mes: 'Ago', label: 'Agosto',     goal: 5409000 },
  { mes: 'Sep', label: 'Septiembre', goal: 5682000 },
  { mes: 'Oct', label: 'Octubre',    goal: 5955000 },
  { mes: 'Nov', label: 'Noviembre',  goal: 6227000 },
  { mes: 'Dic', label: 'Diciembre',  goal: 6500000 },
];

const FIAT_DATA_FALLBACK = {
  'CME-1': { totalEur: 1507997.51, totalUsd: 1779138.83, count: 284, txs: [
    { fecha: '2026-02-17', detalle: 'Duarte Abreu', importe: 42000 },
    { fecha: '2026-02-17', detalle: 'Daniel Carcedo Blanco', importe: 15000 },
    { fecha: '2026-02-17', detalle: 'Acevedo Diaz Gregorio Manuel', importe: 10000 },
    { fecha: '2026-02-17', detalle: 'Elena Calvo Vazquez', importe: 7500 },
    { fecha: '2026-02-16', detalle: 'Inmaculada Perello Fonseca', importe: 5000 },
  ]},
  'RET-2': { totalEur: 281729.46, totalUsd: 334463.34, count: 85, txs: [
    { fecha: '2026-02-17', detalle: 'Perez Marti Angel Fernando', importe: 2500 },
    { fecha: '2026-02-16', detalle: 'Hilario Echevarria Losada', importe: 7500 },
  ]},
  'SLA-3': { totalEur: 771653.03, totalUsd: 913993.11, count: 45, txs: [
    { fecha: '2026-02-04', detalle: 'Miguel Andres Alonso', importe: 3500 },
    { fecha: '2026-02-03', detalle: 'Pena Enciso Maria Esperanza', importe: 10000 },
  ]},
  'GRX-4': { totalEur: 138500, totalUsd: 163984.85, count: 23, txs: [
    { fecha: '2026-02-17', detalle: 'Daniel Carcedo Blanco', importe: 15000 },
    { fecha: '2026-02-16', detalle: 'Silvia Busquets Vilaseca', importe: 10000 },
  ]},
  'LVT-2': { totalEur: 0, totalUsd: 0, count: 0, txs: [] },
};

// ─── HELPERS ───
function getYearFromFecha(fecha) {
  try {
    const f = String(fecha || '');
    if (f.includes('/')) return f.split('/')[2] || null;
    return f.slice(0, 4) || null;
  } catch { return null; }
}

function parseFecha(fecha) {
  try {
    const f = String(fecha || '');
    if (f.includes('/')) {
      const [d, m, y] = f.split('/');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    return new Date(f);
  } catch { return null; }
}

// ─── API ───
async function fetchFiatFromSheet(safes) {
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    if (lines.length < 2) throw new Error('Sheet vacía');
    const COL = { fecha: 4, proyecto: 5, detalle: 7, importeEur: 8, usd: 11, estado: 13 };
    const SAFE_NAMES = safes.filter(s => !s.soldOut).map(s => s.name);
    const parseNum = (str) => {
      const s = (str || '').replace(/"/g, '').trim();
      if (!s) return 0;
      if (s.includes(',') && s.includes('.')) return s.indexOf('.') < s.indexOf(',') ? parseFloat(s.replace(/\./g, '').replace(',', '.')) : parseFloat(s.replace(/,/g, ''));
      if (s.includes(',')) return parseFloat(s.replace(',', '.'));
      return parseFloat(s) || 0;
    };
    const result = {}, totalesUsd = {}, totalesEur = {};
    for (let i = 1; i < lines.length; i++) {
      const cols = []; let cur = '', inQuote = false;
      for (const ch of lines[i] + ',') {
        if (ch === '"') inQuote = !inQuote;
        else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
      const clean = (idx) => (cols[idx] || '').replace(/"/g, '').trim();
      const proyecto = clean(COL.proyecto);
      if (!SAFE_NAMES.includes(proyecto)) continue;
      const estado = clean(COL.estado).toLowerCase();
      if (estado === 'devuelto' || estado === 'devuelta') continue;
      const importeEur = parseNum(clean(COL.importeEur));
      const usd = parseNum(clean(COL.usd));
      if (!result[proyecto]) { result[proyecto] = { txs: [] }; totalesUsd[proyecto] = 0; totalesEur[proyecto] = 0; }
      totalesUsd[proyecto] += usd; totalesEur[proyecto] += importeEur;
      const fecha = clean(COL.fecha), detalle = clean(COL.detalle);
      if (fecha && detalle && importeEur > 0) result[proyecto].txs.push({ fecha, detalle, importe: importeEur });
    }
    for (const safe of Object.keys(result)) {
      result[safe].totalEur = totalesEur[safe];
      result[safe].totalUsd = totalesUsd[safe];
      result[safe].count = result[safe].txs.length;
    }
    if (Object.keys(result).length === 0) throw new Error('No safes en sheet');
    return result;
  } catch (err) { console.error('[Sheet]', err.message); return null; }
}

async function getBalance(address) {
  try {
    const res = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=0x89`, { headers: { accept: 'application/json', 'X-API-Key': MORALIS_KEY } });
    const data = await res.json();
    if (!Array.isArray(data)) return '0.00';
    const token = data.find(t => t.token_address?.toLowerCase() === USDT.toLowerCase());
    return token ? (parseInt(token.balance) / Math.pow(10, token.decimals)).toFixed(2) : '0.00';
  } catch { return '0.00'; }
}

async function getTransfers(address) {
  try {
    let all = [], cursor = null, pages = 0;
    while (pages < 20) {
      const url = `https://deep-index.moralis.io/api/v2.2/${address}/erc20/transfers?chain=0x89&contract_addresses[]=${USDT}&limit=100${cursor ? '&cursor=' + cursor : ''}`;
      const res = await fetch(url, { headers: { accept: 'application/json', 'X-API-Key': MORALIS_KEY } });
      const data = await res.json();
      if (!data.result?.length) break;
      all = [...all, ...data.result.filter(tx => tx.to_address?.toLowerCase() === address.toLowerCase())];
      cursor = data.cursor; pages++;
      if (!cursor) break;
      await new Promise(r => setTimeout(r, 100));
    }
    return all;
  } catch { return []; }
}

function processTransfers(transfers) {
  const p = transfers.map(tx => ({
    hash: tx.transaction_hash, from: tx.from_address,
    value: parseFloat((parseInt(tx.value) / 1e6).toFixed(2)),
    timestamp: new Date(tx.block_timestamp),
  })).sort((a, b) => b.timestamp - a.timestamp);
  const total = p.reduce((s, t) => s + t.value, 0);
  return { transfers: p, metrics: { total: total.toFixed(2), count: p.length, average: p.length ? (total / p.length).toFixed(2) : '0.00' } };
}

const fmt = (n) => '$' + parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n) => parseFloat(n).toFixed(1) + '%';
const isValidAddress = (addr) => /^0x[0-9a-fA-F]{40}$/.test(addr);
const fmtDate = (d) => d ? d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

const SoldOutBadge = () => (
  <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'linear-gradient(135deg,#f59e0b22,#ef444422)', border:'1px solid #f59e0b88', borderRadius:6, padding:'2px 8px', fontSize:'0.68em', fontWeight:800, letterSpacing:'0.1em', color:'#fbbf24', textTransform:'uppercase' }}>🔒 SOLD OUT</div>
);

// ─── PROMEDIO DIARIO ───
function PromedioSection({ safes, fiatData, data, COLORS }) {
  const today = new Date();
  const [desde, setDesde] = useState('2026-01-01');
  const [hasta, setHasta] = useState(today.toISOString().slice(0, 10));
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta); hastaDate.setHours(23,59,59);
  const diffDays = Math.max(1, Math.round((hastaDate - desdeDate) / 86400000) + 1);

  const safeStats = safes.map((safe, idx) => {
    // Para sold out: usar frozenData directamente
    if (safe.soldOut && safe.frozenData) {
      const totalUsd = safe.frozenData.totalUsd || 0;
      const fiatUsd = safe.frozenData.fiatUsd || 0;
      const criptoUsd = safe.frozenData.criptoUsd || 0;
      return { safe, idx, fiatUsd, criptoUsd, totalUsd, fiatCount: safe.frozenData.inversores||0, criptoCount: safe.frozenData.criptoTxs||0, promDia: totalUsd/diffDays, activeDays: diffDays, minDate: null, maxDate: null, color: COLORS[idx] };
    }
    let fiatEur = 0, fiatCount = 0;
    const sf = fiatData[safe.name];
    if (sf) (sf.txs||[]).forEach(tx => { const d = parseFecha(tx.fecha); if (d && d >= desdeDate && d <= hastaDate) { fiatEur += tx.importe||0; fiatCount++; } });
    const fiatUsd = fiatEur * EUR_USD;
    let criptoUsd = 0, criptoCount = 0;
    const safeData = (data||[]).find(d => d.name === safe.name);
    if (safeData) (safeData.transfers||[]).forEach(tx => { if (tx.timestamp >= desdeDate && tx.timestamp <= hastaDate) { criptoUsd += tx.value||0; criptoCount++; } });
    const totalUsd = fiatUsd + criptoUsd;
    const allDates = [];
    if (sf) (sf.txs||[]).forEach(tx => { const d = parseFecha(tx.fecha); if (d) allDates.push(d); });
    if (safeData) (safeData.transfers||[]).forEach(tx => { if (tx.timestamp) allDates.push(tx.timestamp); });
    const minDate = allDates.length ? new Date(Math.min(...allDates)) : null;
    const maxDate = allDates.length ? new Date(Math.max(...allDates)) : null;
    const activeDays = minDate && maxDate ? Math.max(1, Math.round((maxDate-minDate)/86400000)+1) : diffDays;
    return { safe, idx, fiatUsd, criptoUsd, totalUsd, fiatCount, criptoCount, promDia: activeDays>0?totalUsd/activeDays:0, activeDays, minDate, maxDate, color: COLORS[idx] };
  });

  const totalEnRango = safeStats.reduce((s,x)=>s+x.totalUsd,0);
  const totalFiatRango = safeStats.reduce((s,x)=>s+x.fiatUsd,0);
  const totalCriptoRango = safeStats.reduce((s,x)=>s+x.criptoUsd,0);

  return (
    <div className="card" style={{ padding:20, marginTop:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ fontSize:'0.78em', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700 }}>📈 Promedio Diario de Captación</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto', flexWrap:'wrap' }}>
          <label style={{ fontSize:'0.75em', color:'#64748b' }}>Desde</label>
          <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:6, padding:'5px 8px', color:'#f1f5f9', fontSize:'0.82em', fontFamily:'monospace', outline:'none' }} />
          <label style={{ fontSize:'0.75em', color:'#64748b' }}>Hasta</label>
          <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:6, padding:'5px 8px', color:'#f1f5f9', fontSize:'0.82em', fontFamily:'monospace', outline:'none' }} />
          <span style={{ fontSize:'0.75em', color:'#00d4aa', background:'#00d4aa18', borderRadius:6, padding:'4px 10px', border:'1px solid #00d4aa33' }}>{diffDays} días</span>
          <button onClick={()=>{setDesde('2026-01-01');setHasta(today.toISOString().slice(0,10));}} style={{ background:'#1e293b', color:'#94a3b8', border:'1px solid #334155', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:'0.78em', fontFamily:'monospace' }}>↺</button>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:20 }}>
        {[
          { label:'Total en Rango', value:fmt(totalEnRango), sub:'Fiat + Cripto', color:'#00d4aa' },
          { label:'Promedio / Día', value:fmt(diffDays>0?totalEnRango/diffDays:0), sub:'Global todos los safes', color:'#818cf8' },
          { label:'Fiat en Rango', value:fmt(totalFiatRango), sub:fmt(diffDays>0?totalFiatRango/diffDays:0)+'/día', color:'#60a5fa' },
          { label:'Cripto en Rango', value:fmt(totalCriptoRango), sub:fmt(diffDays>0?totalCriptoRango/diffDays:0)+'/día', color:'#fb923c' },
        ].map((k,i)=>(
          <div key={i} style={{ background:'#0f172a', borderRadius:10, padding:'14px 16px', borderLeft:'3px solid '+k.color }}>
            <div style={{ fontSize:'0.72em', color:'#64748b', textTransform:'uppercase', marginBottom:6 }}>{k.label}</div>
            <div style={{ fontSize:'1.35em', fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:'0.72em', color:'#475569', marginTop:3 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:'0.75em', color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Promedio Diario por Safe</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:10 }}>
        {safeStats.map((s,i)=>(
          <div key={i} style={{ background:'#0f172a', borderRadius:10, padding:'14px 16px', borderLeft:'3px solid '+s.color, opacity:s.safe.soldOut?0.7:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontWeight:700, color:s.color, fontSize:'0.95em' }}>{s.safe.name}</span>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                {s.safe.soldOut && <SoldOutBadge />}
                <span style={{ fontSize:'0.7em', color:'#475569' }}>{s.activeDays}d</span>
              </div>
            </div>
            <div style={{ fontSize:'1.5em', fontWeight:700, color:s.color, marginBottom:4 }}>{fmt(s.promDia)}<span style={{ fontSize:'0.45em', color:'#64748b' }}>/día</span></div>
            <div style={{ background:'#1e293b', borderRadius:3, height:3, marginBottom:8 }}>
              <div style={{ background:s.color, borderRadius:3, height:3, width:pct(totalEnRango>0?(s.totalUsd/totalEnRango)*100:0) }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              <div style={{ fontSize:'0.7em', color:'#475569' }}>Total: <span style={{ color:'#f1f5f9', fontWeight:600 }}>{fmt(s.totalUsd)}</span></div>
              <div style={{ fontSize:'0.7em', color:'#475569', textAlign:'right' }}>{pct(totalEnRango>0?(s.totalUsd/totalEnRango)*100:0)}</div>
              {s.minDate && <div style={{ fontSize:'0.65em', color:'#334155', gridColumn:'1/-1' }}>1ª tx: {fmtDate(s.minDate)}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN MODAL ───
function AdminModal({ adminUnlocked, pinInput, setPinInput, pinError, handlePinSubmit, handleCloseAdmin, safes, editIdx, setEditIdx, editName, setEditName, editAddr, setEditAddr, handleEditSave, handleDeleteSafe, handleToggleSoldOut, newSafeName, setNewSafeName, newSafeAddr, setNewSafeAddr, addError, addSuccess, handleAddSafe, handleResetDefaults, saving, data }) {
  const hasData = !!data;
  return (
    <div style={{ position:'fixed', inset:0, background:'#00000099', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="card" style={{ width:'100%', maxWidth:640, maxHeight:'90vh', overflowY:'auto', padding:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'1.1em' }}>⚙️ Panel de Administración</div>
            <div style={{ fontSize:'0.75em', color:'#475569', marginTop:3 }}>Cambios sincronizados para todos los usuarios</div>
          </div>
          <button onClick={handleCloseAdmin} style={{ background:'#334155', border:'none', color:'#94a3b8', borderRadius:7, padding:'6px 12px', cursor:'pointer', fontSize:'0.9em', fontFamily:'monospace' }}>✕ Cerrar</button>
        </div>
        <div style={{ background:'#00d4aa18', border:'1px solid #00d4aa44', borderRadius:8, padding:'8px 14px', marginBottom:16, fontSize:'0.78em', color:'#00d4aa', display:'flex', alignItems:'center', gap:8 }}>
          🌐 Storage compartido — visible para todos los usuarios
          {saving && <span style={{ marginLeft:'auto', color:'#fb923c' }}>⏳ Guardando...</span>}
        </div>
        {!hasData && adminUnlocked && (
          <div style={{ background:'#f59e0b18', border:'1px solid #f59e0b44', borderRadius:8, padding:'8px 14px', marginBottom:16, fontSize:'0.78em', color:'#f59e0b' }}>
            ⚠️ Para marcar Sold Out, primero carga el dashboard (datos en tiempo real)
          </div>
        )}
        {!adminUnlocked ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:'2.5em', marginBottom:16 }}>🔒</div>
            <div style={{ color:'#94a3b8', fontSize:'0.9em', marginBottom:20 }}>Introduce el PIN de administrador</div>
            <input autoFocus type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePinSubmit()} placeholder="••••" maxLength={8}
              style={{ background:'#0f172a', border:'1px solid '+(pinError?'#ef4444':'#334155'), borderRadius:8, padding:'12px 16px', color:'#f1f5f9', fontSize:'1.2em', textAlign:'center', width:160, letterSpacing:'0.3em', outline:'none', fontFamily:'monospace' }} />
            {pinError && <div style={{ color:'#ef4444', fontSize:'0.8em', marginTop:8 }}>{pinError}</div>}
            <div style={{ marginTop:16 }}><button onClick={handlePinSubmit} style={{ background:'#00d4aa', color:'#0f172a', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, cursor:'pointer', fontFamily:'monospace' }}>Acceder</button></div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:'0.78em', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>
                Safes ({safes.length}) · {safes.filter(s=>s.soldOut).length} cerrados · {safes.filter(s=>!s.soldOut).length} activos
              </div>
              {safes.map((safe, idx) => (
                <div key={idx} style={{ background:'#0f172a', borderRadius:10, padding:'12px 14px', marginBottom:8, borderLeft:'3px solid '+(safe.soldOut?'#f59e0b':COLOR_PALETTE[idx%COLOR_PALETTE.length]), opacity:safe.soldOut?0.88:1 }}>
                  {editIdx === idx ? (
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                      <input value={editName} onChange={e=>setEditName(e.target.value)} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:6, padding:'6px 10px', color:'#f1f5f9', fontSize:'0.85em', width:90, fontFamily:'monospace' }} />
                      <input value={editAddr} onChange={e=>setEditAddr(e.target.value)} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:6, padding:'6px 10px', color:'#f1f5f9', fontSize:'0.78em', flex:1, minWidth:200, fontFamily:'monospace' }} />
                      <button onClick={()=>handleEditSave(idx)} disabled={saving} style={{ background:'#00d4aa', color:'#0f172a', border:'none', borderRadius:6, padding:'6px 12px', fontWeight:700, cursor:'pointer', fontSize:'0.8em', fontFamily:'monospace' }}>Guardar</button>
                      <button onClick={()=>setEditIdx(null)} style={{ background:'#334155', color:'#94a3b8', border:'none', borderRadius:6, padding:'6px 12px', cursor:'pointer', fontSize:'0.8em', fontFamily:'monospace' }}>Cancelar</button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ color:safe.soldOut?'#f59e0b':COLOR_PALETTE[idx%COLOR_PALETTE.length], fontWeight:700, fontSize:'0.9em', minWidth:56 }}>{safe.name}</span>
                      {safe.soldOut && <SoldOutBadge />}
                      <span style={{ color:'#475569', fontSize:'0.72em', flex:1, wordBreak:'break-all', minWidth:80 }}>{safe.address}</span>
                      {safe.soldOut && safe.frozenData && (
                        <span style={{ fontSize:'0.68em', color:'#94a3b8', background:'#1e293b', borderRadius:4, padding:'2px 8px', whiteSpace:'nowrap' }}>
                          {fmt(safe.frozenData.totalUsd)} · {safe.frozenData.inversores} inv · {safe.frozenData.date}
                        </span>
                      )}
                      <div style={{ display:'flex', gap:5, flexShrink:0, marginLeft:'auto' }}>
                        {!safe.soldOut && (
                          <button onClick={()=>{setEditIdx(idx);setEditName(safe.name);setEditAddr(safe.address);}} style={{ background:'#1e293b', color:'#818cf8', border:'1px solid #334155', borderRadius:6, padding:'4px 9px', cursor:'pointer', fontSize:'0.72em', fontFamily:'monospace' }}>✏️</button>
                        )}
                        <button
                          onClick={()=>handleToggleSoldOut(idx)}
                          disabled={saving||(!safe.soldOut&&!hasData)}
                          title={!hasData&&!safe.soldOut?'Carga el dashboard primero':safe.soldOut?'Reactivar':'Marcar Sold Out'}
                          style={{ background:safe.soldOut?'#00d4aa18':'#f59e0b18', color:safe.soldOut?'#00d4aa':'#f59e0b', border:'1px solid '+(safe.soldOut?'#00d4aa44':'#f59e0b44'), borderRadius:6, padding:'4px 9px', cursor:(saving||(!safe.soldOut&&!hasData))?'not-allowed':'pointer', fontSize:'0.72em', fontFamily:'monospace', opacity:(!safe.soldOut&&!hasData)?0.35:1 }}
                        >{safe.soldOut?'▶ Reactivar':'🔒 Sold Out'}</button>
                        <button onClick={()=>handleDeleteSafe(idx)} disabled={saving} style={{ background:'#1e293b', color:'#ef4444', border:'1px solid #334155', borderRadius:6, padding:'4px 9px', cursor:'pointer', fontSize:'0.72em', fontFamily:'monospace' }}>🗑</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ background:'#0f172a', borderRadius:12, padding:'18px 16px', marginBottom:16 }}>
              <div style={{ fontSize:'0.78em', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>➕ Agregar Nuevo Safe</div>
              <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:10, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:'0.72em', color:'#475569', marginBottom:5 }}>Nombre</div>
                  <input value={newSafeName} onChange={e=>setNewSafeName(e.target.value)} placeholder="ABD-1" style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:7, padding:'9px 11px', color:'#f1f5f9', fontSize:'0.88em', fontFamily:'monospace', outline:'none' }} />
                </div>
                <div>
                  <div style={{ fontSize:'0.72em', color:'#475569', marginBottom:5 }}>Dirección Ethereum (0x…)</div>
                  <input value={newSafeAddr} onChange={e=>setNewSafeAddr(e.target.value)} placeholder="0xabc123..." style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:7, padding:'9px 11px', color:'#f1f5f9', fontSize:'0.82em', fontFamily:'monospace', outline:'none' }} />
                </div>
              </div>
              {addError && <div style={{ color:'#ef4444', fontSize:'0.8em', marginBottom:8 }}>⚠️ {addError}</div>}
              {addSuccess && <div style={{ color:'#00d4aa', fontSize:'0.8em', marginBottom:8 }}>{addSuccess}</div>}
              <button onClick={handleAddSafe} disabled={saving} style={{ background:saving?'#334155':'#00d4aa', color:'#0f172a', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, cursor:saving?'default':'pointer', fontFamily:'monospace', fontSize:'0.88em' }}>
                {saving?'⏳ Guardando...':'➕ Agregar Safe'}
              </button>
            </div>
            <div style={{ borderTop:'1px solid #1e293b', paddingTop:16 }}>
              <div style={{ fontSize:'0.72em', color:'#475569', marginBottom:10 }}>⚠️ Zona de peligro</div>
              <button onClick={handleResetDefaults} disabled={saving} style={{ background:'#1e293b', color:'#f472b6', border:'1px solid #334155', borderRadius:8, padding:'8px 18px', cursor:'pointer', fontFamily:'monospace', fontSize:'0.82em' }}>🔄 Restaurar Safes por defecto</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [safes, setSafes] = useState(DEFAULT_SAFES);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loadTime, setLoadTime] = useState(null);
  const [activeTab, setActiveTab] = useState('consolidado');
  const [fiatData, setFiatData] = useState(FIAT_DATA_FALLBACK);
  const [fiatSource, setFiatSource] = useState('fallback');
  const [fiatLastUpdate, setFiatLastUpdate] = useState(null);
  const [fiatLoading, setFiatLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [newSafeName, setNewSafeName] = useState('');
  const [newSafeAddr, setNewSafeAddr] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAddr, setEditAddr] = useState('');

  const COLORS = safes.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length]);
  const soldOutCount = safes.filter(s => s.soldOut).length;
  const activeCount = safes.length - soldOutCount;

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadSafesFromJSONBin();
        if (stored) setSafes(stored);
        setStorageReady(true);
      } catch (e) { setStorageError(true); setStorageReady(true); }
    })();
  }, []);

  const persistSafes = async (updated) => {
    setSaving(true); setSafes(updated);
    const ok = await saveSafesToJSONBin(updated);
    if (!ok) setStorageError(true);
    setSaving(false);
  };

  const refreshFiat = async (currentSafes) => {
    const sf = currentSafes || safes;
    setFiatLoading(true);
    const sheetData = await fetchFiatFromSheet(sf);
    if (sheetData) {
      setFiatData(prev => { const m = {...prev}; Object.keys(sheetData).forEach(k=>{ m[k]=sheetData[k]; }); return m; });
      setFiatSource('sheet'); setFiatLastUpdate(new Date());
    } else { setFiatSource('fallback'); }
    setFiatLoading(false);
  };

  useEffect(() => {
    if (!storageReady) return;
    refreshFiat(safes);
    const iv = setInterval(() => refreshFiat(safes), 60*60*1000);
    return () => clearInterval(iv);
  }, [safes, storageReady]);

  // ── loadAll ──
  // FIX CLAVE: refresca el sheet ANTES de consultar blockchain
  // para que fiatData tenga datos reales cuando se construyen los resultados
  const loadAll = async () => {
    setData(null); setLoading(true);
    const t0 = Date.now();
    try {
      // 1. Refrescar fiat del sheet primero
      setMsg('Actualizando datos fiat del sheet...');
      const sheetData = await fetchFiatFromSheet(safes);
      let fiatActual = { ...fiatData };
      if (sheetData) {
        Object.keys(sheetData).forEach(k => { fiatActual[k] = sheetData[k]; });
        setFiatData(fiatActual);
        setFiatSource('sheet');
        setFiatLastUpdate(new Date());
      }

      // 2. Cargar blockchain solo para activos
      const results = [];
      for (const safe of safes) {
        if (safe.soldOut && safe.frozenData) {
          // Sold out: usar datos congelados, sin tocar Moralis ni sheet
          setMsg(`${safe.name} (SOLD OUT — datos congelados)`);
          results.push({
            ...safe,
            balance: safe.frozenData.balance || '0.00',
            transfers: [],
            metrics: {
              total: (safe.frozenData.criptoUsd || 0).toFixed(2),
              count: safe.frozenData.criptoTxs || 0,
              average: '0.00',
            },
            // SIEMPRE frozenData para fiat de sold out
            fiat: {
              totalEur: safe.frozenData.fiatEur || 0,
              totalUsd: safe.frozenData.fiatUsd || 0,
              count: safe.frozenData.inversores || 0,
              txs: [],
            },
          });
        } else {
          // Activo: consultar blockchain y usar fiatActual (recién del sheet)
          setMsg('Cargando ' + safe.name + '...');
          const [balance, transfers] = await Promise.all([getBalance(safe.address), getTransfers(safe.address)]);
          results.push({
            ...safe,
            balance,
            ...processTransfers(transfers),
            fiat: fiatActual[safe.name] || { totalEur:0, totalUsd:0, count:0, txs:[] },
          });
        }
      }
      setData(results); setLastUpdate(new Date()); setLoadTime(((Date.now()-t0)/1000).toFixed(1));
    } catch (e) { alert('Error: '+e.message); }
    finally { setLoading(false); setMsg(''); }
  };


  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) { setAdminUnlocked(true); setPinError(''); }
    else { setPinError('PIN incorrecto'); setPinInput(''); }
  };

  const handleAddSafe = async () => {
    setAddError(''); setAddSuccess('');
    if (!newSafeName.trim()) return setAddError('El nombre no puede estar vacío');
    if (!isValidAddress(newSafeAddr)) return setAddError('Dirección Ethereum inválida');
    if (safes.find(s=>s.address.toLowerCase()===newSafeAddr.toLowerCase())) return setAddError('Esta dirección ya existe');
    if (safes.find(s=>s.name.toLowerCase()===newSafeName.toLowerCase())) return setAddError('Este nombre ya existe');
    const updated = [...safes, { address: newSafeAddr, name: newSafeName.trim().toUpperCase() }];
    await persistSafes(updated);
    setNewSafeName(''); setNewSafeAddr('');
    setAddSuccess('Safe "'+newSafeName.trim().toUpperCase()+'" añadido ✅');
    setTimeout(()=>setAddSuccess(''), 3000);
    setData(null);
  };

  const handleDeleteSafe = async (idx) => {
    if (!window.confirm('¿Eliminar el safe "'+safes[idx].name+'"?')) return;
    await persistSafes(safes.filter((_,i)=>i!==idx));
    setData(null);
  };

  const handleEditSave = async (idx) => {
    setAddError('');
    if (!editName.trim()) return setAddError('Nombre vacío');
    if (!isValidAddress(editAddr)) return setAddError('Dirección inválida');
    await persistSafes(safes.map((s,i)=>i===idx?{...s,name:editName.trim().toUpperCase(),address:editAddr}:s));
    setEditIdx(null); setData(null);
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('¿Restaurar los Safes por defecto?')) return;
    await persistSafes(DEFAULT_SAFES);
    setAddSuccess('Safes restaurados ✅');
    setTimeout(()=>setAddSuccess(''), 3000);
    setData(null);
  };

  // ── SOLD OUT ──
  // Al freezar se captura el desglose 2026 además del total histórico
  const handleToggleSoldOut = async (idx) => {
    const safe = safes[idx];
    if (safe.soldOut) {
      if (!window.confirm(`¿Reactivar "${safe.name}"?\nVolverá a consultar blockchain y sheet en tiempo real.`)) return;
      const updated = safes.map((s,i) => {
        if (i !== idx) return s;
        const { soldOut, frozenData, ...rest } = s;
        return rest;
      });
      await persistSafes(updated);
      setData(null);
      return;
    }
    if (!data) return;
    const safeData = data.find(d => d.name === safe.name);
    const fiatSafe = fiatData[safe.name] || { totalEur:0, totalUsd:0, count:0, txs:[] };
    const criptoUsd = safeData ? parseFloat(safeData.metrics.total) : 0;
    const criptoTxs = safeData ? safeData.metrics.count : 0;
    const balance = safeData ? safeData.balance : '0.00';
    const totalUsd = fiatSafe.totalUsd + criptoUsd;
    const today = new Date().toLocaleDateString('es-ES');

    // Calcular desglose 2026 en el momento del freeze
    const criptoUsd2026 = safeData
      ? (safeData.transfers||[]).filter(tx => tx.timestamp.getFullYear() === 2026).reduce((s,tx) => s + tx.value, 0)
      : 0;
    const criptoTxs2026 = safeData
      ? (safeData.transfers||[]).filter(tx => tx.timestamp.getFullYear() === 2026).length
      : 0;
    const fiatUsd2026 = (fiatSafe.txs||[])
      .filter(tx => getYearFromFecha(tx.fecha) === '2026')
      .reduce((s,tx) => s + (tx.importe||0) * EUR_USD, 0);
    const fiatCount2026 = (fiatSafe.txs||[]).filter(tx => getYearFromFecha(tx.fecha) === '2026').length;
    const total2026snap = criptoUsd2026 + fiatUsd2026;

    if (!window.confirm(
      `¿Marcar "${safe.name}" como SOLD OUT?\n\n` +
      `Histórico total:\n` +
      `  Fiat: ${fmt(fiatSafe.totalUsd)} (${fiatSafe.count} inv)\n` +
      `  Cripto: ${fmt(criptoUsd)} (${criptoTxs} txs)\n` +
      `  Total: ${fmt(totalUsd)}\n\n` +
      `Solo 2026:\n` +
      `  Fiat: ${fmt(fiatUsd2026)} (${fiatCount2026} txs)\n` +
      `  Cripto: ${fmt(criptoUsd2026)} (${criptoTxs2026} txs)\n` +
      `  Total 2026: ${fmt(total2026snap)}\n\n` +
      `Dejará de consultar Moralis y el sheet.`
    )) return;

    const updated = safes.map((s,i) => i !== idx ? s : {
      ...s,
      soldOut: true,
      frozenData: {
        // Histórico total
        fiatEur: fiatSafe.totalEur, fiatUsd: fiatSafe.totalUsd, inversores: fiatSafe.count,
        criptoUsd, criptoTxs, totalUsd, balance, date: today,
        // Desglose 2026 — usado por el tab 2026
        criptoUsd2026, criptoTxs2026, fiatUsd2026, fiatCount2026, total2026: total2026snap,
      },
    });
    await persistSafes(updated);
    setData(prev => prev ? prev.map(d => d.name === safe.name ? {...d, soldOut:true} : d) : prev);
  };

  const handleCloseAdmin = () => {
    setShowAdmin(false); setAdminUnlocked(false); setPinInput(''); setPinError(''); setEditIdx(null); setAddError('');
  };

  // ── TOTALES ──
  // Fuente de verdad: data[x].fiat y data[x].metrics (incluye frozen de sold out)
  const cTotals = data ? {
    balance: data.reduce((s,d) => s + parseFloat(d.balance), 0).toFixed(2),
    received: data.reduce((s,d) => s + parseFloat(d.metrics.total), 0).toFixed(2),
    txs: data.reduce((s,d) => s + d.metrics.count, 0),
  } : null;

  const fTotals = data ? {
    totalUsd: data.reduce((s,d) => s + (d.fiat?.totalUsd || 0), 0),
    totalEur: data.reduce((s,d) => s + (d.fiat?.totalEur || 0), 0),
    inversores: data.reduce((s,d) => s + (d.fiat?.count || 0), 0),
  } : {
    totalUsd: Object.values(fiatData).reduce((s,d) => s + (d.totalUsd||0), 0),
    totalEur: Object.values(fiatData).reduce((s,d) => s + (d.totalEur||0), 0),
    inversores: Object.values(fiatData).reduce((s,d) => s + (d.count||0), 0),
  };

  const KPI = ({ label, value, sub, color }) => (
    <div className="card" style={{ padding:'18px 20px', borderLeft:'3px solid '+color }}>
      <div style={{ fontSize:'0.78em', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:'1.75em', fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:'0.75em', color:'#475569', marginTop:4 }}>{sub}</div>
    </div>
  );

  const BudgetSection = () => {
    const nowMo = new Date().getMonth();
    const mFiat = new Array(13).fill(0);
    const mCripto = new Array(13).fill(0);

    (data || []).forEach(safe => {
      if (safe.soldOut && safe.frozenData) {
        // Sold out: imputar al mes de cierre usando desglose 2026
        try {
          const parts = (safe.frozenData.date || '').split('/');
          const mo = parseInt(parts[1]);
          if (mo >= 1 && mo <= 12) {
            mFiat[mo] += safe.frozenData.fiatUsd2026 != null ? safe.frozenData.fiatUsd2026 : (safe.fiat?.totalUsd || 0);
            mCripto[mo] += safe.frozenData.criptoUsd2026 != null ? safe.frozenData.criptoUsd2026 : parseFloat(safe.metrics.total || 0);
          }
        } catch(e) {}
      } else {
        // Activo: filtrar por mes y año reales
        const sf = fiatData[safe.name];
        (sf?.txs || []).forEach(tx => {
          try {
            const f = String(tx.fecha || ''); let yr, mo;
            if (f.includes('/')) { const p = f.split('/'); yr = p[2]; mo = parseInt(p[1]); }
            else { yr = f.slice(0,4); mo = parseInt(f.slice(5,7)); }
            if (yr === '2026' && mo >= 1 && mo <= 12) mFiat[mo] += (tx.importe||0) * EUR_USD;
          } catch(e) {}
        });
        (safe.transfers || []).forEach(tx => {
          try { if (tx.timestamp.getFullYear() === 2026) mCripto[tx.timestamp.getMonth()+1] += tx.value||0; } catch(e) {}
        });
      }
    });

    let ytdGoal = 0, ytdReal = 0;
    const rows = BUDGET_2026.map((b, i) => {
      const mo = i+1, real = mFiat[mo] + mCripto[mo], hasPassed = i <= nowMo;
      if (hasPassed) { ytdGoal += b.goal; ytdReal += real; }
      return { ...b, real: hasPassed?real:null, pctVal: hasPassed&&b.goal>0?(real/b.goal)*100:null, gap: hasPassed?b.goal-real:null, onTrack: hasPassed&&real>=b.goal };
    });
    const ytdGap = ytdGoal - ytdReal, ytdPct = ytdGoal > 0 ? (ytdReal/ytdGoal)*100 : 0;

    return (
      <div className="card" style={{ padding:20, marginTop:20 }}>
        <div style={{ fontSize:'0.78em', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>🎯 Budget 2026 — Real vs Goal por Mes</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:20 }}>
          {[
            { label:'Real YTD', value:fmt(ytdReal), color:'#00d4aa', sub:'Captado en 2026' },
            { label:'Goal YTD', value:fmt(ytdGoal), color:'#818cf8', sub:'Objetivo acumulado' },
            { label:'% YTD', value:ytdPct.toFixed(1)+'%', color:ytdPct>=100?'#00d4aa':ytdPct>=80?'#fb923c':'#ef4444', sub:ytdPct>=100?'✅ On track':'⚠️ Por debajo' },
            { label:'Gap YTD', value:(ytdGap<=0?'+':'-')+fmt(Math.abs(ytdGap)), color:ytdGap<=0?'#00d4aa':'#f472b6', sub:ytdGap<=0?'Superado':'Pendiente' },
          ].map((k,i)=>(
            <div key={i} style={{ background:'#0f172a', borderRadius:10, padding:'14px 16px', borderLeft:'3px solid '+k.color }}>
              <div style={{ fontSize:'0.72em', color:'#64748b', textTransform:'uppercase', marginBottom:6 }}>{k.label}</div>
              <div style={{ fontSize:'1.4em', fontWeight:700, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:'0.72em', color:'#475569', marginTop:3 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows} barGap={4} margin={{ top:5, right:10, left:10, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
            <XAxis dataKey="mes" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>'$'+(v>=1000000?(v/1000000).toFixed(1)+'M':(v/1000).toFixed(0)+'K')} tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, fontSize:12, color:'#e2e8f0' }} formatter={(v,name)=>['$'+Math.round(v).toLocaleString('en-US'),name==='goal'?'🎯 Goal':'✅ Real']} labelStyle={{ color:'#94a3b8' }}/>
            <Legend formatter={v=>v==='goal'?'🎯 Goal mensual':'✅ Real captado'} wrapperStyle={{ fontSize:12, color:'#94a3b8' }}/>
            <Bar dataKey="goal" name="goal" fill="#334155" radius={[4,4,0,0]}/>
            <Bar dataKey="real" name="real" radius={[4,4,0,0]}>
              {rows.map((r,i)=><Cell key={i} fill={r.real===null?'transparent':r.onTrack?'#00d4aa':'#fb923c'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.84em', marginTop:16 }}>
          <thead>
            <tr style={{ color:'#475569', fontSize:'0.82em', textTransform:'uppercase' }}>
              {['Mes','Goal Mes','Real Mes','% Cumpl.','Gap','Estado'].map((h,i)=><th key={i} style={{ padding:'7px 10px', textAlign:i>=2?'right':'left', fontWeight:500, borderBottom:'1px solid #1e293b' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="row" style={{ borderBottom:'1px solid #0f172a', opacity:r.real===null?0.28:1 }}>
                <td style={{ padding:'8px 10px', color:'#f1f5f9', fontWeight:600 }}>{r.label}</td>
                <td style={{ padding:'8px 10px', color:'#818cf8' }}>{fmt(r.goal)}</td>
                <td style={{ padding:'8px 10px', textAlign:'right', color:r.real!==null?'#00d4aa':'#334155', fontWeight:700 }}>{r.real!==null?fmt(r.real):'—'}</td>
                <td style={{ padding:'8px 10px', textAlign:'right' }}>{r.pctVal!==null?<span style={{ color:r.pctVal>=100?'#00d4aa':r.pctVal>=80?'#fb923c':'#ef4444', fontWeight:700 }}>{r.pctVal.toFixed(1)}%</span>:'—'}</td>
                <td style={{ padding:'8px 10px', textAlign:'right', color:r.gap===null?'#334155':r.gap<=0?'#00d4aa':'#f472b6' }}>{r.gap===null?'—':(r.gap<=0?'+':'-')+fmt(Math.abs(r.gap))}</td>
                <td style={{ padding:'8px 10px', textAlign:'right' }}>{r.real===null?<span style={{ color:'#334155' }}>Pendiente</span>:r.onTrack?<span style={{ color:'#00d4aa' }}>✅ On track</span>:<span style={{ color:'#fb923c' }}>⚠️ Below</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!storageReady) return (
    <div style={{ minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:'3px solid #1e293b', borderTop:'3px solid #00d4aa', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 20px' }}/>
        <div style={{ color:'#00d4aa', fontWeight:600 }}>Sincronizando configuración...</div>
        <div style={{ color:'#475569', fontSize:'0.8em', marginTop:8 }}>Cargando Safes desde JSONbin</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', color:'#e2e8f0', fontFamily:'monospace' }}>
      <style>{`
        *{box-sizing:border-box;}
        .card{background:#1e293b;border:1px solid #334155;border-radius:12px;}
        .tab{padding:8px 18px;border-radius:8px;cursor:pointer;font-size:0.85em;font-weight:600;border:none;}
        .tab-on{background:#00d4aa;color:#0f172a;}
        .tab-off{background:#1e293b;color:#64748b;border:1px solid #334155;}
        .row:hover td{background:#ffffff06;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .fade{animation:fadeUp 0.4s ease;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        details summary{cursor:pointer;list-style:none;}
        details summary::-webkit-details-marker{display:none;}
        input:focus{border-color:#00d4aa44!important;}
        .so-overlay{position:absolute;inset:0;border-radius:12px;pointer-events:none;background:repeating-linear-gradient(45deg,transparent,transparent 18px,rgba(245,158,11,0.04) 18px,rgba(245,158,11,0.04) 20px);}
      `}</style>

      {showAdmin && (
        <AdminModal
          adminUnlocked={adminUnlocked} pinInput={pinInput} setPinInput={setPinInput}
          pinError={pinError} handlePinSubmit={handlePinSubmit} handleCloseAdmin={handleCloseAdmin}
          safes={safes} editIdx={editIdx} setEditIdx={setEditIdx}
          editName={editName} setEditName={setEditName} editAddr={editAddr} setEditAddr={setEditAddr}
          handleEditSave={handleEditSave} handleDeleteSafe={handleDeleteSafe}
          handleToggleSoldOut={handleToggleSoldOut}
          newSafeName={newSafeName} setNewSafeName={setNewSafeName}
          newSafeAddr={newSafeAddr} setNewSafeAddr={setNewSafeAddr}
          addError={addError} addSuccess={addSuccess}
          handleAddSafe={handleAddSafe} handleResetDefaults={handleResetDefaults}
          saving={saving} data={data}
        />
      )}

      {/* HEADER */}
      <div style={{ borderBottom:'1px solid #1e293b', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, position:'sticky', top:0, background:'#0f172a', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img src={LOGO_SRC} alt="Reental" style={{ height:32, width:'auto', borderRadius:8 }}/>
          <div>
            <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'1.1em' }}>Raised Capital</div>
            <div style={{ fontSize:'0.78em', color:'#64748b' }}>
              Polygon · {activeCount} activos{soldOutCount>0?` · ${soldOutCount} 🔒`:''} · Fiat + Crypto
              {storageError?<span style={{ color:'#fb923c', marginLeft:8 }}>· ⚠️ Error sync</span>:<span style={{ color:'#00d4aa', marginLeft:8 }}>· 🌐 JSONbin</span>}
              {fiatSource==='sheet'&&fiatLastUpdate&&<span style={{ color:'#00d4aa', marginLeft:8 }}>· 📊 Sheet {fiatLastUpdate.toLocaleTimeString()}</span>}
              {fiatSource==='fallback'&&<span style={{ color:'#fb923c', marginLeft:8 }}>· ⚠️ Fiat local</span>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {lastUpdate&&<span style={{ fontSize:'0.75em', color:'#475569' }}>{lastUpdate.toLocaleTimeString()} · {loadTime}s</span>}
          <button onClick={()=>setShowAdmin(true)} style={{ background:'#1e293b', color:'#818cf8', border:'1px solid #334155', borderRadius:7, padding:'6px 14px', fontSize:'0.82em', fontWeight:600, cursor:'pointer', fontFamily:'monospace' }}>⚙️ Admin</button>
          {data&&<>
            <button onClick={loadAll} disabled={loading} style={{ background:'#1e293b', color:'#00d4aa', border:'1px solid #00d4aa44', borderRadius:7, padding:'6px 14px', fontSize:'0.82em', fontWeight:600, cursor:'pointer', fontFamily:'monospace' }}>{loading?'⏳':'↺ Refresh'}</button>

            <button onClick={()=>refreshFiat(safes)} disabled={fiatLoading} style={{ background:fiatLoading?'#0f172a':fiatSource==='sheet'?'#00d4aa18':'#fb923c18', color:fiatLoading?'#475569':fiatSource==='sheet'?'#00d4aa':'#fb923c', border:'1px solid '+(fiatSource==='sheet'?'#00d4aa44':'#fb923c44'), borderRadius:7, padding:'6px 14px', fontSize:'0.82em', fontWeight:600, cursor:fiatLoading?'default':'pointer', fontFamily:'monospace' }}>{fiatLoading?'⟳ Fiat...':'📊 Fiat Sheet'}</button>
          </>}
        </div>
      </div>

      <div style={{ padding:'24px', maxWidth:1400, margin:'0 auto' }}>
        {!data&&!loading&&(
          <div className="fade" style={{ maxWidth:520, margin:'60px auto', textAlign:'center' }}>
            <div style={{ fontSize:'3em', marginBottom:16 }}>🔐</div>
            <div style={{ fontWeight:700, fontSize:'1.5em', color:'#f1f5f9', marginBottom:10 }}>Dashboard listo</div>
            <p style={{ color:'#64748b', fontSize:'0.95em', lineHeight:1.8, marginBottom:32 }}>
              {activeCount} safe{activeCount!==1?'s':''} activo{activeCount!==1?'s':''} consultarán blockchain en tiempo real.
              {soldOutCount>0&&<span style={{ color:'#f59e0b' }}> {soldOutCount} Sold Out con datos congelados.</span>}
            </p>
            <div className="card" style={{ padding:'14px 18px', marginBottom:28, textAlign:'left' }}>
              {safes.map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:i<safes.length-1?'1px solid #334155':'none' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:s.soldOut?'#f59e0b':COLOR_PALETTE[i%COLOR_PALETTE.length], flexShrink:0 }}/>
                  <span style={{ color:s.soldOut?'#f59e0b':COLOR_PALETTE[i%COLOR_PALETTE.length], fontWeight:700, fontSize:'0.9em', minWidth:56 }}>{s.name}</span>
                  {s.soldOut?<SoldOutBadge/>:<span style={{ color:'#475569', fontSize:'0.75em', wordBreak:'break-all' }}>{s.address}</span>}
                </div>
              ))}
            </div>
            <button onClick={loadAll} style={{ background:'#00d4aa', color:'#0f172a', border:'none', borderRadius:9, padding:'14px 40px', fontSize:'1em', fontWeight:700, cursor:'pointer', fontFamily:'monospace' }}>🚀 Cargar Dashboard</button>
            <p style={{ color:'#334155', fontSize:'0.75em', marginTop:12 }}>Tiempo estimado: {activeCount*10}–{activeCount*15}s (solo safes activos)</p>
          </div>
        )}

        {loading&&(
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ width:48, height:48, border:'3px solid #1e293b', borderTop:'3px solid #00d4aa', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 20px' }}/>
            <div style={{ color:'#00d4aa', fontWeight:600, fontSize:'0.9em' }}>Consultando blockchain...</div>
            <div style={{ color:'#475569', fontSize:'0.82em', marginTop:8 }}>{msg}</div>
          </div>
        )}

        {data&&!loading&&(
          <div className="fade">
            <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
              {[['consolidado','📊 Consolidado'],['cripto','🔗 Crypto USDT'],['fiat','🏦 Fiat EUR'],['2026','📅 2026']].map(([id,label])=>(
                <button key={id} className={'tab '+(activeTab===id?'tab-on':'tab-off')} onClick={()=>setActiveTab(id)}>{label}</button>
              ))}
            </div>

            {/* ── CONSOLIDADO ── */}
            {activeTab==='consolidado'&&(()=>{
              const fiatUSD=fTotals.totalUsd, criptoUSD=parseFloat(cTotals.received), totalUSD=fiatUSD+criptoUSD;
              const pctFiat=totalUSD>0?(fiatUSD/totalUSD)*100:0, pctCripto=totalUSD>0?(criptoUSD/totalUSD)*100:0;
              return (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
                    <KPI label="Capital Total (USD)" value={fmt(totalUSD)} sub="Fiat + Cripto unificado" color="#00d4aa"/>
                    <KPI label="Fiat Captado" value={fmt(fiatUSD)} sub={'€'+fTotals.totalEur.toLocaleString('es-ES',{maximumFractionDigits:0})+' → USD'} color="#818cf8"/>
                    <KPI label="Cripto USDT" value={fmt(criptoUSD)} sub="Recibido on-chain" color="#fb923c"/>
                    <KPI label="Total Inversores" value={fTotals.inversores.toLocaleString()} sub={cTotals.txs+' TXs · '+activeCount+' activos / '+soldOutCount+' 🔒'} color="#f472b6"/>
                  </div>
                  <div className="card" style={{ padding:20, marginBottom:20 }}>
                    <div style={{ fontSize:'0.78em', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Mix de Captación — EUR/USD: {EUR_USD} · Todo en USD</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                      {[
                        { label:'🏦 Fiat (EUR→USD)', value:pctFiat, amount:fmt(fiatUSD), sub:'€'+fTotals.totalEur.toLocaleString('es-ES',{maximumFractionDigits:0}), color:'#818cf8' },
                        { label:'🔗 Cripto (USDT)', value:pctCripto, amount:fmt(criptoUSD), sub:cTotals.txs+' transacciones', color:'#fb923c' },
                      ].map((item,i)=>(
                        <div key={i} style={{ background:'#0f172a', borderRadius:10, padding:'18px 20px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                            <span style={{ fontSize:'0.9em', color:'#94a3b8' }}>{item.label}</span>
                            <span style={{ fontSize:'2.2em', fontWeight:700, color:item.color }}>{pct(item.value)}</span>
                          </div>
                          <div style={{ background:'#1e293b', borderRadius:4, height:8, marginBottom:10 }}><div style={{ background:item.color, borderRadius:4, height:8, width:pct(item.value), transition:'width 0.6s ease' }}/></div>
                          <div style={{ fontSize:'0.88em', color:'#f1f5f9', fontWeight:700 }}>{item.amount}</div>
                          <div style={{ fontSize:'0.72em', color:'#475569', marginTop:3 }}>{item.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:'#0f172a', borderRadius:8, padding:'14px 16px' }}>
                      <div style={{ display:'flex', borderRadius:6, overflow:'hidden', height:28, marginBottom:10 }}>
                        <div style={{ background:'#818cf8', width:pct(pctFiat), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72em', fontWeight:700, color:'#0f172a', transition:'width 0.6s ease' }}>{pctFiat>10?pct(pctFiat)+' Fiat':''}</div>
                        <div style={{ background:'#fb923c', width:pct(pctCripto), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72em', fontWeight:700, color:'#0f172a', transition:'width 0.6s ease' }}>{pctCripto>10?pct(pctCripto)+' Cripto':''}</div>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'0.82em', color:'#94a3b8' }}>Total: <strong style={{ color:'#00d4aa', fontSize:'1.1em' }}>{fmt(totalUSD)}</strong></span>
                        <div style={{ display:'flex', gap:14 }}>
                          <span style={{ fontSize:'0.75em', color:'#818cf8' }}>■ Fiat {pct(pctFiat)}</span>
                          <span style={{ fontSize:'0.75em', color:'#fb923c' }}>■ Cripto {pct(pctCripto)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:12 }}>
                    {data.map((safe,idx)=>{
                      const isSO=!!safe.soldOut, bc=isSO?'#f59e0b':COLORS[idx];
                      const safeFiatUSD=safe.fiat?.totalUsd||0, safeCriptoUSD=parseFloat(safe.metrics.total), safeTotalUSD=safeFiatUSD+safeCriptoUSD;
                      const safePctFiat=safeTotalUSD>0?(safeFiatUSD/safeTotalUSD)*100:0, safePctCripto=safeTotalUSD>0?(safeCriptoUSD/safeTotalUSD)*100:0;
                      return (
                        <div key={idx} className="card" style={{ padding:20, borderTop:'3px solid '+bc, position:'relative', overflow:'hidden' }}>
                          {isSO&&<div className="so-overlay"/>}
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                              <div style={{ width:9, height:9, borderRadius:'50%', background:bc }}/>
                              <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:'1.05em' }}>{safe.name}</span>
                              {isSO&&<SoldOutBadge/>}
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:'1.2em', fontWeight:700, color:bc }}>{fmt(safeTotalUSD)}</div>
                              <div style={{ fontSize:'0.75em', color:'#475569' }}>{pct(totalUSD>0?(safeTotalUSD/totalUSD)*100:0)} del total</div>
                              {isSO&&safe.frozenData&&<div style={{ fontSize:'0.65em', color:'#f59e0b66', marginTop:2 }}>🔒 {safe.frozenData.date}</div>}
                            </div>
                          </div>
                          <div style={{ display:'flex', borderRadius:4, overflow:'hidden', height:20, marginBottom:12 }}>
                            <div style={{ background:'#818cf8', width:pct(safePctFiat), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65em', fontWeight:700, color:'#0f172a' }}>{safePctFiat>15?pct(safePctFiat):''}</div>
                            <div style={{ background:isSO?'#fb923c66':'#fb923c', width:pct(safePctCripto), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65em', fontWeight:700, color:'#0f172a' }}>{safePctCripto>15?pct(safePctCripto):''}</div>
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                            {[
                              { label:'🏦 Fiat USD', value:fmt(safeFiatUSD), sub:(safe.fiat?.count||0)+' inversores · '+pct(safePctFiat), color:'#818cf8' },
                              { label:'🔗 Cripto USD', value:fmt(safeCriptoUSD), sub:safe.metrics.count+' txs · '+pct(safePctCripto), color:isSO?'#fb923c88':'#fb923c' },
                            ].map((m,i)=>(
                              <div key={i} style={{ background:'#0f172a', borderRadius:8, padding:'10px 12px' }}>
                                <div style={{ fontSize:'0.72em', color:'#64748b', textTransform:'uppercase', marginBottom:4 }}>{m.label}</div>
                                <div style={{ fontSize:'1.05em', fontWeight:700, color:m.color }}>{m.value}</div>
                                <div style={{ fontSize:'0.72em', color:'#475569', marginTop:2 }}>{m.sub}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── CRIPTO ── */}
            {activeTab==='cripto'&&(
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
                  <KPI label="Balance Total" value={fmt(cTotals.balance)} sub="USDT en todas las Safes" color="#00d4aa"/>
                  <KPI label="Total Recibido" value={fmt(cTotals.received)} sub="Histórico completo" color="#818cf8"/>
                  <KPI label="Transacciones" value={cTotals.txs.toLocaleString()} sub="TXs entrantes" color="#fb923c"/>
                  <KPI label="Activos / Cerrados" value={`${activeCount} / ${soldOutCount}`} sub="Tiempo real vs congelados" color="#f472b6"/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(440px,1fr))', gap:12 }}>
                  {data.map((safe,idx)=>{
                    const isSO=!!safe.soldOut;
                    return (
                      <div key={idx} className="card" style={{ padding:20, borderTop:'3px solid '+(isSO?'#f59e0b':COLORS[idx]), position:'relative', overflow:'hidden' }}>
                        {isSO&&<div className="so-overlay"/>}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, gap:10 }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                              <div style={{ width:8, height:8, borderRadius:'50%', background:isSO?'#f59e0b':COLORS[idx] }}/>
                              <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:'1.05em' }}>{safe.name}</span>
                              {isSO?<SoldOutBadge/>:<span style={{ fontSize:'0.65em', padding:'2px 6px', borderRadius:4, background:COLORS[idx]+'22', color:COLORS[idx], fontWeight:600 }}>POLYGON</span>}
                            </div>
                            <div style={{ fontSize:'0.72em', color:'#475569', wordBreak:'break-all' }}>{safe.address}</div>
                          </div>
                          {!isSO&&<a href={'https://polygonscan.com/address/'+safe.address} target="_blank" rel="noreferrer" style={{ background:'#0f172a', color:COLORS[idx], padding:'5px 11px', borderRadius:6, textDecoration:'none', fontSize:'0.75em', fontWeight:600, whiteSpace:'nowrap', border:'1px solid '+COLORS[idx]+'44', flexShrink:0 }}>Polygonscan ↗</a>}
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
                          {[
                            { label:'Balance', value:fmt(safe.balance), color:isSO?'#f59e0b':COLORS[idx] },
                            { label:'Recibido', value:fmt(safe.metrics.total), color:'#00d4aa' },
                            { label:'TXs', value:safe.metrics.count.toLocaleString(), color:'#94a3b8' },
                            { label:'Promedio', value:fmt(safe.metrics.average), color:'#64748b' },
                          ].map((m,i)=>(
                            <div key={i} style={{ background:'#0f172a', borderRadius:8, padding:'11px 8px', textAlign:'center' }}>
                              <div style={{ fontSize:'0.72em', color:'#475569', textTransform:'uppercase', marginBottom:5 }}>{m.label}</div>
                              <div style={{ fontSize:'1em', fontWeight:700, color:m.color }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                        {isSO?(
                          <div style={{ background:'#f59e0b11', border:'1px solid #f59e0b33', borderRadius:8, padding:'10px 14px', fontSize:'0.78em', color:'#f59e0b88', textAlign:'center' }}>
                            🔒 Datos congelados · No consulta Moralis · Cerrado {safe.frozenData?.date||''}
                          </div>
                        ):safe.transfers.length>0&&(
                          <details>
                            <summary style={{ background:'#0f172a', padding:'8px 12px', borderRadius:7, fontSize:'0.8em', color:'#64748b', userSelect:'none' }}>▶ Últimas {Math.min(safe.transfers.length,10)} de {safe.transfers.length} TXs USDT</summary>
                            <div style={{ marginTop:10, overflowX:'auto' }}>
                              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8em' }}>
                                <thead><tr style={{ color:'#475569', fontSize:'0.88em', textTransform:'uppercase' }}>{['Fecha','Desde','USDT','TX'].map((h,i)=><th key={i} style={{ padding:'6px 10px', textAlign:i===2?'right':i===3?'center':'left', fontWeight:500 }}>{h}</th>)}</tr></thead>
                                <tbody>
                                  {safe.transfers.slice(0,10).map((tx,i)=>(
                                    <tr key={i} className="row" style={{ borderBottom:'1px solid #1e293b' }}>
                                      <td style={{ padding:'7px 10px', color:'#94a3b8' }}>{tx.timestamp.toLocaleDateString()}</td>
                                      <td style={{ padding:'7px 10px', color:'#64748b' }}>{tx.from.slice(0,8)}…{tx.from.slice(-4)}</td>
                                      <td style={{ padding:'7px 10px', textAlign:'right', color:'#00d4aa', fontWeight:700 }}>+{fmt(tx.value)}</td>
                                      <td style={{ padding:'7px 10px', textAlign:'center' }}><a href={'https://polygonscan.com/tx/'+tx.hash} target="_blank" rel="noreferrer" style={{ color:COLORS[idx], textDecoration:'none' }}>↗</a></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── FIAT ── */}
            {activeTab==='fiat'&&(
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
                  <KPI label="Total Captado (USD)" value={fmt(fTotals.totalUsd)} sub={'€'+fTotals.totalEur.toLocaleString('es-ES',{maximumFractionDigits:0})+' convertido'} color="#00d4aa"/>
                  <KPI label="Total Inversores" value={fTotals.inversores.toLocaleString()} sub="Inversores activos" color="#818cf8"/>
                  <KPI label="Mayor Proyecto" value={data.slice().sort((a,b)=>(b.fiat?.totalUsd||0)-(a.fiat?.totalUsd||0))[0]?.name||'—'} sub={fmt(data.slice().sort((a,b)=>(b.fiat?.totalUsd||0)-(a.fiat?.totalUsd||0))[0]?.fiat?.totalUsd||0)} color="#fb923c"/>
                  <KPI label="Promedio / Proyecto" value={fmt(fTotals.totalUsd/safes.length)} sub="USD por safe" color="#f472b6"/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(440px,1fr))', gap:12 }}>
                  {data.map((safe,idx)=>{
                    const isSO=!!safe.soldOut;
                    const fiat=safe.fiat||{totalEur:0,totalUsd:0,count:0,txs:[]};
                    return (
                      <div key={idx} className="card" style={{ padding:20, borderTop:'3px solid '+(isSO?'#f59e0b':COLORS[idx]), position:'relative', overflow:'hidden' }}>
                        {isSO&&<div className="so-overlay"/>}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                            <div style={{ width:9, height:9, borderRadius:'50%', background:isSO?'#f59e0b':COLORS[idx] }}/>
                            <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:'1.05em' }}>{safe.name}</span>
                            {isSO&&<SoldOutBadge/>}
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ color:isSO?'#f59e0b':COLORS[idx], fontWeight:700, fontSize:'1.2em' }}>{fmt(fiat.totalUsd)}</div>
                            <div style={{ fontSize:'0.72em', color:'#475569' }}>€{fiat.totalEur.toLocaleString('es-ES',{maximumFractionDigits:0})}</div>
                          </div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                          {[
                            { label:'Inversores', value:fiat.count, color:isSO?'#f59e0b':COLORS[idx] },
                            { label:'Promedio', value:fmt(fiat.count>0?fiat.totalUsd/fiat.count:0), color:'#94a3b8' },
                          ].map((m,i)=>(
                            <div key={i} style={{ background:'#0f172a', borderRadius:8, padding:'11px 8px', textAlign:'center' }}>
                              <div style={{ fontSize:'0.72em', color:'#475569', textTransform:'uppercase', marginBottom:5 }}>{m.label}</div>
                              <div style={{ fontSize:i===0?'1.4em':'1.1em', fontWeight:700, color:m.color }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                        {isSO?(
                          <div style={{ background:'#f59e0b11', border:'1px solid #f59e0b33', borderRadius:8, padding:'10px 14px', fontSize:'0.78em', color:'#f59e0b88', textAlign:'center' }}>
                            🔒 No consulta el sheet · Datos congelados a {safe.frozenData?.date||''}
                          </div>
                        ):(fiat.txs||[]).length>0?(
                          <details>
                            <summary style={{ background:'#0f172a', padding:'8px 12px', borderRadius:7, fontSize:'0.8em', color:'#64748b', userSelect:'none' }}>▶ Últimas {fiat.txs.length} transacciones fiat</summary>
                            <div style={{ marginTop:10 }}>
                              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8em' }}>
                                <thead><tr style={{ color:'#475569', fontSize:'0.88em', textTransform:'uppercase' }}>{['Fecha','Inversor','EUR','USD'].map((h,i)=><th key={i} style={{ padding:'6px 10px', textAlign:i>=2?'right':'left', fontWeight:500 }}>{h}</th>)}</tr></thead>
                                <tbody>
                                  {fiat.txs.map((tx,i)=>(
                                    <tr key={i} className="row" style={{ borderBottom:'1px solid #1e293b' }}>
                                      <td style={{ padding:'7px 10px', color:'#94a3b8' }}>{tx.fecha}</td>
                                      <td style={{ padding:'7px 10px', color:'#64748b' }}>{tx.detalle}</td>
                                      <td style={{ padding:'7px 10px', textAlign:'right', color:'#475569' }}>€{tx.importe.toLocaleString('es-ES',{maximumFractionDigits:2})}</td>
                                      <td style={{ padding:'7px 10px', textAlign:'right', color:'#00d4aa', fontWeight:700 }}>{fmt(tx.importe*EUR_USD)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        ):<div style={{ background:'#0f172a', borderRadius:8, padding:'14px', textAlign:'center', color:'#334155', fontSize:'0.82em' }}>Sin transacciones fiat registradas</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 2026 ── */}
            {activeTab==='2026'&&(()=>{
              // CRIPTO 2026:
              // Sold out con frozenData.criptoUsd2026 → usar ese valor (solo txs de 2026)
              // Sold out sin criptoUsd2026 (freeze antiguo) → usar total como aproximación
              // Activos → filtrar transfers reales por año 2026
              let cripto2026Total = 0, cripto2026Txs = 0;
              data.forEach(safe => {
                if (safe.soldOut && safe.frozenData) {
                  cripto2026Total += (safe.frozenData.criptoUsd2026 != null) ? safe.frozenData.criptoUsd2026 : parseFloat(safe.metrics.total||0);
                  cripto2026Txs  += (safe.frozenData.criptoTxs2026 != null) ? safe.frozenData.criptoTxs2026 : (safe.metrics.count||0);
                } else {
                  (safe.transfers||[]).forEach(tx => {
                    if (tx.timestamp.getFullYear() === 2026) { cripto2026Total += tx.value||0; cripto2026Txs++; }
                  });
                }
              });

              // FIAT 2026:
              // Sold out con frozenData.fiatUsd2026 → usar ese valor (solo fiat de 2026)
              // Sold out sin fiatUsd2026 (freeze antiguo) → usar total fiat como aproximación
              // Activos → filtrar txs del sheet por año 2026
              let fiat2026Total = 0, fiat2026Count = 0;
              data.forEach(safe => {
                if (safe.soldOut && safe.frozenData) {
                  fiat2026Total += (safe.frozenData.fiatUsd2026 != null) ? safe.frozenData.fiatUsd2026 : (safe.fiat?.totalUsd||0);
                  fiat2026Count += (safe.frozenData.fiatCount2026 != null) ? safe.frozenData.fiatCount2026 : (safe.fiat?.count||0);
                } else {
                  const sf = fiatData[safe.name]; if (!sf) return;
                  (sf.txs||[]).forEach(tx => {
                    if (getYearFromFecha(tx.fecha) === '2026') { fiat2026Total += (tx.importe||0)*EUR_USD; fiat2026Count++; }
                  });
                }
              });

              const total2026 = cripto2026Total + fiat2026Total;
              const pctFiat2026 = total2026>0?(fiat2026Total/total2026)*100:0;
              const pctCripto2026 = total2026>0?(cripto2026Total/total2026)*100:0;

              return (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
                    <KPI label="Capital Total 2026 (USD)" value={fmt(total2026)} sub="Fiat + Cripto en 2026" color="#00d4aa"/>
                    <KPI label="Fiat 2026" value={fmt(fiat2026Total)} sub={fiat2026Count+' inversores'} color="#818cf8"/>
                    <KPI label="Cripto 2026 (USDT)" value={fmt(cripto2026Total)} sub={cripto2026Txs+' TXs on-chain'} color="#fb923c"/>
                    <KPI label="Mix Fiat / Cripto" value={pctFiat2026.toFixed(1)+'% / '+pctCripto2026.toFixed(1)+'%'} sub="Fiat vs Cripto 2026" color="#f472b6"/>
                  </div>
                  <PromedioSection safes={safes} fiatData={fiatData} data={data} COLORS={COLORS}/>
                  <BudgetSection/>
                </div>
              );
            })()}

            <div style={{ marginTop:32, textAlign:'center', color:'#1e293b', fontSize:'0.72em' }}>
              Raised Capital · Polygon · Moralis API · {activeCount} activos · {soldOutCount} 🔒 · 🌐 JSONbin sync
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
