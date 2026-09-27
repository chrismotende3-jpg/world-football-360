import {createClient} from '@supabase/supabase-js';
export function clientForToken(token){
  const options=token?{global:{headers:{Authorization:`Bearer ${token}`}}}:{};
  return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,options);
}
export async function userFromToken(token){
  if(!token) return null;
  const s=clientForToken(token);
  const {data,error}=await s.auth.getUser(token);
  if(error||!data.user)return null;
  return {client:s,user:data.user};
}
