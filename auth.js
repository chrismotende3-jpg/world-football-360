import {userFromToken} from '../services/supabase.js';
export async function requireAuth(req,res,next){
  try{
    const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
    const auth=await userFromToken(token);
    if(!auth)return res.status(401).json({error:'Authentication required'});
    req.auth=auth; next();
  }catch(e){next(e)}
}
export async function requireAdmin(req,res,next){
  try{
    const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
    const auth=await userFromToken(token);
    if(!auth)return res.status(401).json({error:'Authentication required'});
    const {data,error}=await auth.client.rpc('is_admin');
    if(error)throw error;
    if(data!==true)return res.status(403).json({error:'Admin access required'});
    req.auth=auth; next();
  }catch(e){next(e)}
}
