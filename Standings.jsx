import {useEffect,useState} from 'react';
import {football} from '../services/api';
import {LEAGUES} from '../services/config';

export default function Standings(){
  const [league,setLeague]=useState(LEAGUES.EPL);
  const [rows,setRows]=useState([]);
  const [error,setError]=useState('');

  useEffect(()=>{
    let active=true;
    setError('');
    setRows([]);
    football.standings(league)
      .then(x=>{if(active)setRows(x.response?.[0]?.league?.standings?.[0]||[])})
      .catch(e=>{if(active){setRows([]);setError(e.message||'Unable to load standings')}});
    return()=>{active=false};
  },[league]);

  return <div className="page">
    <h1>Standings</h1>
    <select value={league} onChange={e=>setLeague(Number(e.target.value))}>
      <option value={LEAGUES.EPL}>EPL</option>
      <option value={LEAGUES.KPL}>KPL</option>
    </select>
    {error&&<p className="error">{error}</p>}
    <div className="tableWrap"><table><thead><tr><th>#</th><th>Team</th><th>Pts</th><th>GD</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.team.id}><td>{r.rank}</td><td>{r.team.name}</td><td>{r.points}</td><td>{r.goalsDiff}</td></tr>)}</tbody>
    </table></div>
    {!rows.length&&!error&&<p>Loading standings…</p>}
  </div>;
}
