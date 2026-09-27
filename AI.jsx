import {useState} from 'react';
import {api} from '../services/api';
export default function AI(){
  const [q,setQ]=useState(''),[a,setA]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
  async function ask(){
    const question=q.trim(); if(!question||loading)return;
    setLoading(true);setError('');setA('');
    try{const r=await api('/ai',{method:'POST',body:JSON.stringify({question})});setA(r.answer||'No answer returned.');}
    catch(e){setError(e.message||'Football AI is temporarily unavailable.');}
    finally{setLoading(false)}
  }
  return <div className="page narrow"><h1>Football AI</h1><textarea value={q} maxLength={2000} onChange={e=>setQ(e.target.value)} placeholder="Ask a football question…"/><button className="btn" disabled={loading||!q.trim()} onClick={ask}>{loading?'Thinking…':'Ask AI'}</button>{error&&<div className="state error">{error}</div>}{a&&<div className="card answer"><p>{a}</p></div>}</div>
}
