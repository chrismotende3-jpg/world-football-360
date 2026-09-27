import {Router} from 'express';
import {requireAuth} from '../middleware/auth.js';
const r=Router();
const MAX_QUESTION_LENGTH=2000;
const REQUEST_TIMEOUT_MS=30000;
r.post('/',requireAuth,async(q,s,n)=>{
  try{
    if(!process.env.OPENAI_API_KEY)return s.status(503).json({error:'Football AI is not configured: OPENAI_API_KEY is missing'});
    const question=String(q.body?.question||'').trim();
    if(!question)return s.status(400).json({error:'A football question is required'});
    if(question.length>MAX_QUESTION_LENGTH)return s.status(400).json({error:`Question is too long (maximum ${MAX_QUESTION_LENGTH} characters)`});
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    try{
      const body={model:process.env.OPENAI_MODEL||'gpt-5-mini',input:`You are Football World 360 AI. Answer this football question accurately and briefly. Do not claim live information unless it is provided by the application: ${question}`};
      const x=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify(body),signal:controller.signal});
      const d=await x.json().catch(()=>({}));
      if(!x.ok) return s.status(x.status===429?429:502).json({error:d.error?.message||'AI request failed'});
      s.json({answer:d.output_text||d.output?.filter?.(x=>x.type==='message').flatMap?.(x=>x.content||[]).find?.(x=>x.type==='output_text')?.text||'No answer returned'});
    }finally{clearTimeout(timer)}
  }catch(e){if(e?.name==='AbortError')return s.status(504).json({error:'Football AI timed out. Please try again.'});n(e)}
});
export default r;
