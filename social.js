import {api} from './api';
export const social={
 notifications:()=>api('/social/notifications'),
 readNotification:id=>api(`/social/notifications/${id}/read`,{method:'POST'}),
 groups:()=>api('/social/groups'),
 createGroup:(name,fixture_id=null)=>api('/social/groups',{method:'POST',body:JSON.stringify({name,fixture_id})}),
 groupMessages:id=>api(`/social/groups/${id}/messages`),
 sendGroupMessage:(id,body)=>api(`/social/groups/${id}/messages`,{method:'POST',body:JSON.stringify({body})})
};
