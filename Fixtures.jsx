import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {football} from '../services/api';
import {LEAGUES} from '../services/config';

export default function Fixtures(){
  const [league,setLeague]=useState(LEAGUES.EPL);
  const [items,setItems]=useState([]);
  const [error,setError]=useState('');

  useEffect(()=>{
    let active=true;
    setError('');
    setItems([]);
    football.fixtures(league)
      .then(x=>{if(active)setItems(Array.isArray(x.response)?x.response:[])})
      .catch(e=>{if(active)setError(e.message||'Unable to load fixtures')});
    return()=>{active=false};
  },[league]);

  return <div className="page">
    <h1>Fixtures</h1>
    <select value={league} onChange={e=>setLeague(Number(e.target.value))}>
      <option value={LEAGUES.EPL}>EPL</option>
      <option value={LEAGUES.KPL}>KPL</option>
    </select>
    {error&&<p className="error">{error}</p>}
    <div className="cards">
      {items.map(x=><Link className="card" to={`/matches/${x.fixture?.id}`} key={x.fixture?.id}>
        <b>{x.teams?.home?.name||'Home'}</b> vs <b>{x.teams?.away?.name||'Away'}</b>
        <small>{x.fixture?.date?new Date(x.fixture.date).toLocaleString():''}</small>
      </Link>)}
    </div>
    {!items.length&&!error&&<p>Loading fixtures…</p>}
  </div>;
}
