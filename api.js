import { API_BASE, FOOTBALL_SEASON } from './config';
const REQUEST_TIMEOUT_MS=20000;
export async function api(path,options={}){
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  const token=localStorage.getItem('fw360_access_token');
  if(token) headers.Authorization=`Bearer ${token}`;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const r=await fetch(`${API_BASE}${path}`,{...options,headers,signal:options.signal||controller.signal});
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.error||data.message||`Request failed (${r.status})`);
    return data;
  }catch(e){
    if(e?.name==='AbortError') throw new Error('The request timed out. Please try again.');
    throw e;
  }finally{clearTimeout(timer)}
}
const season=()=>FOOTBALL_SEASON;
export const football={
 fixtures:(league=39,s=season())=>api(`/football/fixtures?league=${league}&season=${s}`),
 live:(league=39)=>api(`/football/fixtures/live?league=${league}`),
 standings:(league=39,s=season())=>api(`/football/standings?league=${league}&season=${s}`),
 teams:(league=39,s=season())=>api(`/football/teams?league=${league}&season=${s}`),
 team:id=>api(`/football/teams/${encodeURIComponent(id)}`),
 teamSquad:id=>api(`/football/teams/${encodeURIComponent(id)}/squad`),
 player:(id,s=season())=>api(`/football/players/${encodeURIComponent(id)}?season=${s}`),
 topScorers:(league=39,s=season())=>api(`/football/topscorers?league=${league}&season=${s}`),
 topAssists:(league=39,s=season())=>api(`/football/topassists?league=${league}&season=${s}`),
 match:id=>api(`/football/matches/${encodeURIComponent(id)}`),
 events:id=>api(`/football/matches/${encodeURIComponent(id)}/events`),
 statistics:id=>api(`/football/matches/${encodeURIComponent(id)}/statistics`),
 lineups:id=>api(`/football/matches/${encodeURIComponent(id)}/lineups`),
 leagues:(country='Kenya',s='')=>api(`/football/leagues?country=${encodeURIComponent(country)}${s?`&season=${encodeURIComponent(s)}`:''}`),
 seasons:()=>api('/football/seasons')
};
