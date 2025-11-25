import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

const initialForm = {
  id: '',
  date: new Date().toISOString().slice(0,10),
  model: '',
  bodyNo: '',
  partNo: '',
  partName: '',
  factory: '',
  cp: '',
  cc: '',
  problem: '',
  detail: '',
  positionName: '',
  terminalPosition: '',
  description: '',
  repairedBy: '',
  qty: 1,
  problemPhoto: '',
  drawingDetail: '',
  labelPhoto: ''
};

function storageKeyForUser(user){ return `lr_records_${user}`; }

export default function App(){
  const [username, setUsername] = useState(localStorage.getItem('lr_username') || '');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('lr_username'));
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState([]);
  const fileRefs = useRef({});

  useEffect(()=>{ if(loggedIn) loadUserRecords(); }, [loggedIn, username]);

  function saveUsername(){
    if(!username) return alert('Zadej uzivatelske jmeno');
    localStorage.setItem('lr_username', username);
    setLoggedIn(true);
    loadUserRecords();
  }
  function logout(){ localStorage.removeItem('lr_username'); setLoggedIn(false); setUsername(''); setRecords([]); }

  function loadUserRecords(){
    const raw = localStorage.getItem(storageKeyForUser(username));
    if(!raw){ setRecords([]); return; }
    try{ setRecords(JSON.parse(raw)); }catch(e){ setRecords([]); }
  }
  function persistRecords(newRecords){ localStorage.setItem(storageKeyForUser(username), JSON.stringify(newRecords)); setRecords(newRecords); }

  function handleChange(e){ const {name, value} = e.target; setForm(prev=>({...prev, [name]: value})); }
  function handleNumber(e){ const {name, value} = e.target; setForm(prev=>({...prev, [name]: parseInt(value||0,10)})); }

  function handleImage(e, field){
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=> setForm(prev=>({...prev, [field]: reader.result}));
    reader.readAsDataURL(f);
  }

  function clearImage(field){ setForm(prev=>({...prev, [field]: ''})); }

  function saveRecord(e){
    if(e) e.preventDefault();
    const rec = {...form, id: form.id||uuidv4(), createdAt: new Date().toISOString()};
    const filtered = records.filter(r=>r.id!==rec.id);
    const newRecords = [rec, ...filtered];
    persistRecords(newRecords);
    setForm({...initialForm, date: rec.date});
    alert('Zaznam ulozen (lokalne)');
  }

  function editRecord(id){ const r = records.find(x=>x.id===id); if(r) setForm(r); window.scrollTo({top:0, behavior:'smooth'}); }
  function deleteRecord(id){ if(!confirm('Smazat zaznam?')) return; const newRecords = records.filter(r=>r.id!==id); persistRecords(newRecords); }

  function flatten(r){ return {
    user: username,
    date: r.date, model:r.model, bodyNo:r.bodyNo, partNo:r.partNo, partName:r.partName,
    factory:r.factory, cp:r.cp, cc:r.cc, problem:r.problem, detail:r.detail,
    positionName:r.positionName, terminalPosition:r.terminalPosition, description:r.description,
    repairedBy:r.repairedBy, qty:r.qty, problemPhoto: r.problemPhoto? '[image]' : '', drawingDetail: r.drawingDetail? '[image]':'', labelPhoto: r.labelPhoto? '[image]':'', createdAt:r.createdAt
  }; }

  function exportForDate(dateStr){
    const rows = records.filter(r=>r.date===dateStr).map(flatten);
    if(rows.length===0) return alert('Zadne zaznamy pro vybrane datum');
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    XLSX.writeFile(wb, `report_${username}_${dateStr}.xlsx`);
  }

  function mergeAllAndExport(dateStr){
    const all = [];
    for(const k in localStorage){
      if(!k.startsWith('lr_records_')) continue;
      try{
        const arr = JSON.parse(localStorage.getItem(k)||'[]');
        const user = k.replace('lr_records_','');
        arr.forEach(r=> all.push({user, ...flatten(r)}));
      }catch(e){}
    }
    const rows = all.filter(r=>r.date===dateStr);
    if(rows.length===0) return alert('Zadne zaznamy ke slouceni');
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Merged');
    XLSX.writeFile(wb, `merged_report_all_${dateStr}.xlsx`);
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Line Report — Prototype</h1>
        {loggedIn && <div style={{fontSize:12}}>User: {username}</div>}
      </div>

      {!loggedIn ? (
        <div className="card">
          <label>Uzivatelske jmeno</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} />
          <div style={{marginTop:8}}>
            <button className="button" onClick={saveUsername}>Prihlasit</button>
          </div>
        </div>
      ):(
        <>
        <form className="card" onSubmit={saveRecord}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
            <div><strong>Novy zaznam</strong></div>
            <div>
              <button type="button" className="button" onClick={()=>{ setForm({...initialForm, date: new Date().toISOString().slice(0,10)}); }}>Novy</button>
              <button type="button" className="button" onClick={logout} style={{marginLeft:8}}>Odhlasit</button>
            </div>
          </div>
          <div className="form-grid">
            <label>Datum<input name="date" type="date" value={form.date} onChange={handleChange} /></label>
            <label>Model<input name="model" value={form.model} onChange={handleChange} /></label>
            <label>Body no.<input name="bodyNo" value={form.bodyNo} onChange={handleChange} /></label>
            <label>Part no.<input name="partNo" value={form.partNo} onChange={handleChange} /></label>
            <label>Part name<input name="partName" value={form.partName} onChange={handleChange} /></label>
            <label>Factory<input name="factory" value={form.factory} onChange={handleChange} /></label>
            <label>CP<input name="cp" value={form.cp} onChange={handleChange} /></label>
            <label>CC<input name="cc" value={form.cc} onChange={handleChange} /></label>
            <label style={{gridColumn:'1 / -1'}}>Problem<input name="problem" value={form.problem} onChange={handleChange} /></label>
            <label style={{gridColumn:'1 / -1'}}>Detail<textarea name="detail" value={form.detail} onChange={handleChange} rows={2}></textarea></label>
            <label>Position name<input name="positionName" value={form.positionName} onChange={handleChange} /></label>
            <label>Terminal position<input name="terminalPosition" value={form.terminalPosition} onChange={handleChange} /></label>
            <label style={{gridColumn:'1 / -1'}}>Description<textarea name="description" value={form.description} onChange={handleChange} rows={2}></textarea></label>
            <label>Repaired by<input name="repairedBy" value={form.repairedBy} onChange={handleChange} /></label>
            <label>Qty<input name="qty" type="number" value={form.qty} onChange={handleNumber} /></label>

            <label style={{gridColumn:'1 / -1'}}>Problem photo<input ref={el=>fileRefs.current['p']=el} accept="image/*" capture="environment" type="file" onChange={e=>handleImage(e,'problemPhoto')} /></label>
            {form.problemPhoto && <img src={form.problemPhoto} alt="p" className="preview-img" />}

            <label style={{gridColumn:'1 / -1'}}>Drawing / Detail<input ref={el=>fileRefs.current['d']=el} accept="image/*" type="file" onChange={e=>handleImage(e,'drawingDetail')} /></label>
            {form.drawingDetail && <img src={form.drawingDetail} alt="d" className="preview-img" />}

            <label style={{gridColumn:'1 / -1'}}>Label photo<input ref={el=>fileRefs.current['l']=el} accept="image/*" type="file" onChange={e=>handleImage(e,'labelPhoto')} /></label>
            {form.labelPhoto && <img src={form.labelPhoto} alt="l" className="preview-img" />}
          </div>

          <div style={{marginTop:10}}>
            <button className="button" type="submit">Ulozit zaznam</button>
            <button type="button" className="button" onClick={()=>{ setForm({...initialForm, date: form.date}); }} style={{marginLeft:8}}>Vymazat pole</button>
          </div>
        </form>

        <div className="card" style={{marginTop:12}}>
          <h3>Seznam zaznamu ({records.length})</h3>
          <div>
            {records.length===0 && <div style={{color:'#6b7280'}}>Zadne zaznamy</div>}
            {records.map(r=>(
              <div key={r.id} className="list-item">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:13,color:'#6b7280'}}>{r.date} • {r.model} • {r.partNo}</div>
                    <div style={{fontWeight:600}}>{r.problem||'—'}</div>
                  </div>
                  <div>
                    <button className="button" onClick={()=>editRecord(r.id)}>Edit</button>
                    <button className="button" onClick={()=>deleteRecord(r.id)} style={{marginLeft:6}}>Smazat</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:10}}>
            <label>Export date<input id="exportDate" defaultValue={new Date().toISOString().slice(0,10)} type="date" /></label>
            <div style={{marginTop:8}}>
              <button className="button" onClick={()=>exportForDate(document.getElementById('exportDate').value)}>Exportovat (Excel)</button>
              <button className="button" onClick={()=>mergeAllAndExport(document.getElementById('exportDate').value)} style={{marginLeft:8}}>Sloucit vsechny uzivatele</button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
