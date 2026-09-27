const BASE='https://v3.football.api-sports.io';
const REQUEST_TIMEOUT_MS=15000;

async function call(path){
  if(!process.env.FOOTBALL_API_KEY) throw new Error('FOOTBALL_API_KEY is not configured');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const r=await fetch(`${BASE}${path}`,{
      headers:{'x-apisports-key':process.env.FOOTBALL_API_KEY,'accept':'application/json'},
      signal:controller.signal
    });
    const d=await r.json().catch(()=>({message:'Invalid API response'}));
    if(!r.ok){
      if(r.status===429) throw new Error('Football data provider rate limit reached. Please try again shortly.');
      throw new Error(d.message||`Football API request failed (${r.status})`);
    }
    if(d.errors&&Object.keys(d.errors).length){
      const details=Object.entries(d.errors).map(([k,v])=>`${k}: ${typeof v==='string'?v:JSON.stringify(v)}`).join('; ');
      throw new Error(details);
    }
    return d;
  }catch(e){
    if(e?.name==='AbortError') throw new Error('Football data provider timed out. Please try again.');
    throw e;
  }finally{
    clearTimeout(timer);
  }
}

const enc=encodeURIComponent;
export const football={
  fixtures:(l,s,extra='')=>call(`/fixtures?league=${l}&season=${s}${extra}`),
  live:(l)=>call(`/fixtures?live=${l}`),
  standings:(l,s)=>call(`/standings?league=${l}&season=${s}`),
  teams:(l,s)=>call(`/teams?league=${l}&season=${s}`),
  team:id=>call(`/teams?id=${id}`),
  squad:id=>call(`/players/squads?team=${id}`),
  player:(id,s)=>call(`/players?id=${id}&season=${s}`),
  topScorers:(l,s)=>call(`/players/topscorers?league=${l}&season=${s}`),
  topAssists:(l,s)=>call(`/players/topassists?league=${l}&season=${s}`),
  match:id=>call(`/fixtures?id=${id}`),
  events:id=>call(`/fixtures/events?fixture=${id}`),
  statistics:id=>call(`/fixtures/statistics?fixture=${id}`),
  lineups:id=>call(`/fixtures/lineups?fixture=${id}`),
  leagues:(country='Kenya',s='')=>call(`/leagues?country=${enc(country)}${s?`&season=${enc(s)}`:''}`),
  seasons:()=>call('/leagues/seasons')
};
