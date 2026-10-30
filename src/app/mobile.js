/* ---------- Mobile enhancements ---------- */
/* 1. The phone's Back button / swipe-back goes to the previous page (or closes an open window) instead of leaving the app. */
let MOBK='',MOBSKIP=0,MOBPOP=0;
const _go0=go;
go=function(v,id){const r=_go0.apply(this,arguments);try{
  if(innerWidth<1024){const s=$('sb');if(s&&!s.classList.contains('-translate-x-full')){s.classList.add('-translate-x-full');const o=$('ov');if(o)o.classList.add('hidden')}}
  if(!MOBPOP&&U){const k=V+'|'+(V=='patient'||V=='card'?(PID||''):'');if(k!=MOBK){try{history.pushState({k},'')}catch(e){}MOBK=k}}}catch(e){}return r};
addEventListener('popstate',e=>{if(MOBSKIP){MOBSKIP=0;return}if(!U||!C)return;
  const m=$('md');if(m&&m.classList.contains('flex')){cl();MOBSKIP=1;history.forward();return}
  const k=e.state&&e.state.k;if(!k)return;const[v,id]=k.split('|');MOBPOP=1;MOBK=k;try{_go0(v,id||undefined)}finally{MOBPOP=0}});
try{history.replaceState({k:'dash|'},'');MOBK='dash|'}catch(e){}
/* 2. Browser bar / status bar takes the clinic colour (admin: head-office colour). */
function mobTheme(){let m=document.querySelector('meta[name=theme-color]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m)}m.content=(C&&(isHQ()?HQ.color:C.color))||'#dc2626'}
const _st0=setTheme;setTheme=function(c){_st0(c);try{mobTheme()}catch(e){}};
/* 3. Tap a phone number to call it. */
const telA=(n,cls)=>{const d=String(n||'').replace(/[^\d+]/g,'');return d?`<a href="tel:${H(d)}" onclick="event.stopPropagation()" class="${cls||''}" style="color:inherit;text-decoration:none">${H(n)}</a>`:H(n||'')};
