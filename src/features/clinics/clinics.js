/* clinic create / edit */
let CT=null,CK=null,CA={u:'',p:''};
function clinicModal(c,ok,auth){CT={...c};CK=ok;CA={u:'',p:''};cmr(auth?1:0);md.classList.replace('hidden','flex')}
function cmr(auth){if(auth&&$('ca_u')&&$('ca_p')){CA.u=$('ca_u').value;CA.p=$('ca_p').value}const t=CT;$('mb').innerHTML=`<h3 class="font-bold text-xl mb-3">${t.id?'Edit Clinic':'Create Clinic'}</h3>
 ${auth?`<p class="text-xs text-gray-500 mb-2">Admin sign-in is required to create a clinic.</p><input id="ca_u" value="${H(CA.u)}" class="inp mb-2" placeholder="Admin username" autocapitalize="none"><input id="ca_p" value="${H(CA.p)}" type="password" class="inp mb-3" placeholder="Admin password">`:''}
 <label class="block text-sm font-medium mb-1">Clinic name</label><input value="${H(t.name)}" oninput="CT.name=this.value" class="inp mb-3">
 <label class="block text-sm font-medium mb-1">Clinic name in Amharic <span class="text-gray-400 font-normal">(printed on papers, optional)</span></label><input value="${H(t.name_am)}" oninput="CT.name_am=this.value" class="inp mb-3">
 <label class="block text-sm font-medium mb-1">Phone number(s) <span class="text-gray-400 font-normal">(printed on papers)</span></label><input value="${H(t.phone)}" oninput="CT.phone=this.value" class="inp mb-3" placeholder="e.g. 0911000000 / 0922000000">
 <label class="block text-sm font-medium mb-1">Address <span class="text-gray-400 font-normal">(printed at the bottom of papers)</span></label><input value="${H(t.address)}" oninput="CT.address=this.value" class="inp mb-3">
 <label class="block text-sm font-medium mb-1">Clinic type</label><select onchange="CT.type=this.value" class="inp mb-3"><option value="government" ${t.type=='government'?'selected':''}>Government Dental Clinic</option><option value="private" ${t.type!='government'?'selected':''}>Private Dental Clinic Center</option></select>
 <label class="block text-sm font-medium mb-1">Colour</label><div class="flex items-center gap-2 mb-3 flex-wrap"><input type="color" value="${t.color}" oninput="CT.color=this.value;cmp()" class="w-12 h-10 p-0 border rounded">${['#dc2626','#2563eb','#059669','#7c3aed','#ea580c','#0891b2','#be185d'].map(x=>`<button onclick="CT.color='${x}';cmr(${auth})" class="w-8 h-8 rounded-full border" style="background:${x}"></button>`).join('')}</div>
 <label class="block text-sm font-medium mb-1">Icon</label><div class="flex flex-wrap gap-2 mb-3">${Object.keys(ICONS).map(k=>`<button onclick="CT.icon='${k}';CT.logo=null;cmr(${auth})" class="rounded-full ${t.icon==k&&!t.logo?'ring-2 ring-offset-2 ring-gray-700':''}">${logoH({color:t.color,icon:k},'w-10 h-10')}</button>`).join('')}</div>
 <label class="block text-sm font-medium mb-1">Or upload your own logo</label><div class="mb-3 flex justify-start">${photoBtns('cLogo',0,','+auth)}</div>
 <div class="flex items-center gap-3 mb-4"><span class="text-sm text-gray-500">Preview</span><div id="cmp">${logoH(t,'w-14 h-14')}</div></div>
 ${t.id?'':`<div class="border rounded-lg p-3 mb-4 bg-gray-50"><div class="text-sm font-medium mb-1">Clinic admin account (manager) <span class="text-gray-400 font-normal">(optional)</span></div><div class="grid grid-cols-2 gap-2"><input value="${H(t.mu)}" oninput="CT.mu=this.value" class="inp" placeholder="Username" autocapitalize="none"><input value="${H(t.mp)}" oninput="CT.mp=this.value" class="inp" placeholder="Password"></div></div>`}
 <div class="flex justify-end gap-2"><button onclick="cl()" class="px-4 py-2 rounded bg-gray-200">Cancel</button><button id="cm_save" onclick="cmSave(${auth})" class="px-4 py-2 rounded bg-red-600 text-white">Save</button></div>`}
const cmp=()=>{$('cmp').innerHTML=logoH(CT,'w-14 h-14')};
function cLogo(e,auth){const f=e.target.files[0];if(f)rs(f,200,d=>{CT.logo=d;cmr(auth)},true)}
async function cmSave(auth){const t=CT;if(!t.name||!t.name.trim())return bad('Clinic name is required.');t.name=t.name.trim();
 if(!t.id&&(t.mu||t.mp)){if(!(t.mu||'').trim()||!(t.mp||'').trim())return bad('Enter both a manager username and password, or leave both blank.');if(t.mp.trim().length<6)return bad('The manager password must be at least 6 characters.')}
 const sb=$('cm_save');if(sb)sb.disabled=true;
 try{if(auth){let a;try{a=await DB.signIn($('ca_u').value,$('ca_p').value)}catch(e){throw new Error('Valid admin username and password are required.')}if(a.role!='admin'){await DB.signOut();throw new Error('Only an admin can create a clinic.')}}
  try{await CK(t)}finally{if(auth)await DB.signOut()}}catch(e){alert(e.message||'Could not save the clinic.');if(sb)sb.disabled=false}}
async function mkClinic(t){const n={...t,id:'c'+Date.now()};delete n.mu;delete n.mp;await DB.saveClinic(n);if(t.mu&&t.mp){try{await DB.fn('create',{username:t.mu.trim(),password:t.mp.trim(),role:'manager',clinic:n.id,name:'Manager'})}catch(e){alert('The clinic was created, but the manager account failed: '+e.message)}}CL.push(n);return n}
function newClinicLogin(){clinicModal({name:'',type:'private',color:'#2563eb',icon:'tooth',logo:null},async t=>{const n=await mkClinic(t);lcInit();lc.value=n.id;selC();cl()},1)}
function addC(){if(!U||U.role!='admin')return bad('Only the system administrator can create a clinic.');clinicModal({name:'',type:'private',color:'#2563eb',icon:'tooth',logo:null},async t=>{await mkClinic(t);cl();go('clinics')})}
function edC(id){if(!U||U.role!='admin')return bad('Only the system administrator can edit a clinic.');const c=CL.find(x=>x.id==id);clinicModal(c,async t=>{const n={...c,...t};await DB.saveClinic(n);Object.assign(c,t);if(c.id==C.id){setTheme(C);hdr()}cl();go('clinics')})}
/* admin: switch the clinic whose data is shown, staying on the same page */
async function swCh(id){if(id==C.id)return;try{await SQ}catch(e){}try{const v=V;await loadClinic(id);setCur();hdr();go(['patient','card'].includes(v)?'recent':v)}catch(e){alert(e.message);hdr()}}
async function swC(id){try{await SQ}catch(e){}try{await loadClinic(id);setCur();hdr();go('dash')}catch(e){alert(e.message)}}
async function delC(id){if(!U||U.role!='admin')return bad('Only the system administrator can delete a clinic.');const c=CL.find(x=>x.id==id);if(!c||CL.length<2)return;
 if(!confirm('Delete "'+c.name+'" with ALL its patients, records, finance data and staff accounts? This cannot be undone.'))return;
 const t=prompt('To confirm, type the clinic name exactly:\n'+c.name);if(t==null)return;if(t.trim().toLowerCase()!=c.name.trim().toLowerCase())return alert('The name did not match. Nothing was deleted.');
 try{try{await SQ}catch(e){}
  if(c.id==C.id){const o=CL.find(x=>x.id!=id);await loadClinic(o.id);setCur();hdr()}
  await DB.fn('purge_clinic',{clinic:id});await DB.deleteClinic(id);
  try{if(typeof IDB!='undefined'){IDB.del('cache:'+id);IDB.del('dirty:'+id)}}catch(e){}
  CL=CL.filter(x=>x.id!=id);S.usersLoaded=0;lcInit();go('clinics')}catch(e){alert(e.message)}}
function clinics(){return hd('Clinics',bb('New Clinic +','addC()'))+`<div class="grid md:grid-cols-2 gap-4">${CL.map(c=>`<div class="bg-white rounded-xl shadow p-4 flex items-center gap-3">${logoH(c,'w-14 h-14')}<div class="flex-1 min-w-0"><div class="font-bold leading-tight break-words">${H(c.name)}</div><div class="text-xs text-gray-500">${TYPE(c.type)}${c.id==C.id?' · Current':''}</div></div><div class="flex items-center gap-3 whitespace-nowrap">${c.id!=C.id?`<button onclick="swC('${c.id}')" class="text-xs border rounded px-2 py-1">Switch</button>`:''}<i class="fa fa-pen text-red-600 cursor-pointer" onclick="edC('${c.id}')"></i>${CL.length>1&&U.role=='admin'?`<i class="fa fa-trash text-rose-600 cursor-pointer" onclick="delC('${c.id}')"></i>`:''}</div></div>`).join('')}</div>`}
