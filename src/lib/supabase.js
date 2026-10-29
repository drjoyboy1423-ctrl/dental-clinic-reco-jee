/* Data layer: Supabase auth + shared database. Everything the app stores goes through DB. */
const SB_URL='https://qorufqosjdhefnafwfzh.supabase.co',SB_KEY='sb_publishable_2aGJ8SWeZBbWKtTJ8DdpeA_amjSfx39';
const DB=(()=>{
 let sb=null;
 const email=u=>{u=String(u).trim().toLowerCase();return u.includes('@')?u:u+'@dental.app'};
 const ck=r=>{if(r.error)throw new Error(r.error.message||'Request failed');return r.data};
 const prof=r=>r&&({...r,clinic:r.clinic});
 return {
  async init(){if(!window.supabase)throw new Error('Could not load the sign-in library. Check your internet connection.');sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'dental_auth'},global:{fetch:(u,o)=>{o=o||{};if(o.headers&&typeof o.headers.entries=='function'&&!Array.isArray(o.headers))o={...o,headers:Object.fromEntries(o.headers.entries())};return fetch(u,o)}}})},
  async clinics(){return ck(await sb.from('clinics').select('*').order('created_at'))},
  async profile(){const {data}=await sb.auth.getSession();if(!data.session)return null;const r=await sb.from('profiles').select('*').eq('id',data.session.user.id).maybeSingle();if(r.error||!r.data){await sb.auth.signOut();return null}return prof(r.data)},
  async signIn(username,password){const r=await sb.auth.signInWithPassword({email:email(username),password});if(r.error)throw new Error('Invalid username or password.');const p=await sb.from('profiles').select('*').eq('id',r.data.user.id).maybeSingle();if(p.error||!p.data){await sb.auth.signOut();throw new Error('This account has no profile. Ask your admin.')}return prof(p.data)},
  async token(){const {data}=await sb.auth.getSession();return data.session?data.session.access_token:null},
  async signOut(){try{await sb.auth.signOut()}catch(e){}},
  async loadClinicData(cid){const [p,l]=await Promise.all([sb.from('patients').select('id,data').eq('clinic',cid).limit(5000),sb.from('clinic_lists').select('kind,data').eq('clinic',cid)]);const pr=ck(p),ls=ck(l),o={dis:null,proc:null};ls.forEach(x=>o[x.kind]=x.data);return {patients:pr.map(r=>r.data),dis:o.dis,proc:o.proc}},
  async savePatients(cid,ins,upd,del){const now=new Date().toISOString();
   if(ins.length)ck(await sb.from('patients').insert(ins.map(p=>({id:p.id,clinic:cid,data:p,updated_at:now}))));
   await Promise.all(upd.map(async p=>ck(await sb.from('patients').update({data:p,updated_at:now}).eq('id',p.id))));
   if(del.length)ck(await sb.from('patients').delete().in('id',del.map(Number)))},
  async saveList(cid,kind,data){ck(await sb.from('clinic_lists').upsert({clinic:cid,kind,data,updated_at:new Date().toISOString()}))},
  async saveClinic(c){ck(await sb.from('clinics').upsert({id:c.id,name:c.name,type:c.type,color:c.color,icon:c.icon,logo:c.logo||null}))},
  async deleteClinic(id){ck(await sb.from('clinics').delete().eq('id',id))},
  async users(){return ck(await sb.from('profiles').select('*').order('created_at'))},
  async recoverRequest(username){const r=await fetch(SB_URL+'/functions/v1/recover-password',{method:'POST',headers:{'Content-Type':'application/json',apikey:SB_KEY,Authorization:'Bearer '+SB_KEY},body:JSON.stringify({username,origin:location.origin})});const j=await r.json().catch(()=>({}));if(!r.ok||j.error)throw new Error(j.error||'Could not send the email. Try again.');return j.message},
  async recoverApply(tokenHash,pw){const v=await sb.auth.verifyOtp({token_hash:tokenHash,type:'recovery'});if(v.error)throw new Error('This reset link is invalid or has expired. Request a new one.');const u=await sb.auth.updateUser({password:pw});if(u.error)throw new Error(u.error.message||'Could not set the password.');await sb.auth.signOut()},
  async fn(action,payload){const {data}=await sb.auth.getSession();if(!data.session)throw new Error('Please sign in again.');
   let r;try{r=await fetch(SB_URL+'/functions/v1/manage-users',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token,apikey:SB_KEY},body:JSON.stringify({action,...payload})})}catch(e){throw new Error('Could not reach the server. Check your internet connection.')}
   const j=await r.json().catch(()=>({}));if(!r.ok||j.error)throw new Error(j.error||'Request failed');return j},
  async updateProfile(id,f){const allowed=['name','phone','email','title','exp','idcode','blood','expiry','avatar','branch'],o={};allowed.forEach(k=>{if(f[k]!==undefined)o[k]=f[k]});ck(await sb.from('profiles').update(o).eq('id',id))},
  async changePassword(username,oldPw,newPw){const r=await sb.auth.signInWithPassword({email:email(username),password:oldPw});if(r.error)throw new Error('Current password is wrong.');const u=await sb.auth.updateUser({password:newPw});if(u.error)throw new Error(u.error.message)}
 }})();
