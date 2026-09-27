import {useEffect,useState} from 'react';
import {content} from '../services/content';

function embedUrl(item){
  try{
    const u=new URL(item.url);
    if(item.provider==='youtube'){
      if(u.hostname==='youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?rel=0`;
      const id=u.searchParams.get('v') || (u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)||[])[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
    }
    if(item.provider==='vimeo'){
      const id=(u.pathname.match(/\/(?:video\/)?(\d+)/)||[])[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  }catch{}
  return null;
}

export default function AuthorizedMoment(){
 const [item,setItem]=useState(null);
 useEffect(()=>{let live=true;content.media().then(x=>{const rows=(x.media||[]).filter(m=>m.authorized);if(live&&rows.length)setItem(rows[Math.floor(Math.random()*rows.length)])}).catch(()=>{});return()=>{live=false}},[]);
 const src=item&&embedUrl(item);
 if(!item||!src)return null;
 return <section className="card moment"><h2>Football Moment</h2><div className="videoFrame"><iframe title={item.title} src={src} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><p>{item.title}</p></section>;
}
