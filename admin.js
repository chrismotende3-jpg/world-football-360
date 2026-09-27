import {api} from './api';
export const admin={
 news:(body)=>api('/admin/news',{method:'POST',body:JSON.stringify(body)}),
 deleteNews:id=>api(`/admin/news/${id}`,{method:'DELETE'}),
 poll:body=>api('/admin/polls',{method:'POST',body:JSON.stringify(body)}),
 quiz:body=>api('/admin/quizzes',{method:'POST',body:JSON.stringify(body)}),
 media:body=>api('/admin/media',{method:'POST',body:JSON.stringify(body)}),
 competition:body=>api('/admin/competitions',{method:'POST',body:JSON.stringify(body)}),
 team:body=>api('/admin/teams',{method:'POST',body:JSON.stringify(body)}),
 player:body=>api('/admin/players',{method:'POST',body:JSON.stringify(body)}),
 fixture:body=>api('/admin/fixtures',{method:'POST',body:JSON.stringify(body)}),
 users:()=>api('/admin/users')
};
