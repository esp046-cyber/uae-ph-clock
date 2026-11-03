"use strict";
const Clock=(()=>{
  const NS="http://www.w3.org/2000/svg",fmts={};
  const el=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
  function parts(tz,t){
    const f=fmts[tz]||(fmts[tz]=new Intl.DateTimeFormat("en-GB",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}));
    const o={};f.formatToParts(t).forEach(p=>o[p.type]=+p.value);return o}
  const stamp=(o)=>Date.UTC(o.year,o.month-1,o.day,o.hour,o.minute,o.second);
  function diffHours(t){return (stamp(parts("Asia/Manila",t))-stamp(parts("Asia/Dubai",t)))/36e5}
  function build(svg){
    el("circle",{class:"bezel",cx:100,cy:100,r:94},svg);el("circle",{class:"face",cx:100,cy:100,r:90},svg);
    for(let i=0;i<60;i++){const big=i%5===0,a=i*6*Math.PI/180,r1=big?76:83;
      el("line",{class:"tick"+(i%15===0?" big":""),x1:100+r1*Math.sin(a),y1:100-r1*Math.cos(a),x2:100+86*Math.sin(a),y2:100-86*Math.cos(a),"stroke-width":big?3:1},svg)}
    const h=el("line",{class:"hand",x1:100,y1:100,x2:100,y2:56,"stroke-width":6},svg),
          m=el("line",{class:"hand",x1:100,y1:100,x2:100,y2:34,"stroke-width":4},svg),
          s=el("line",{class:"hand sec",x1:100,y1:114,x2:100,y2:24,"stroke-width":1.6},svg);
    el("circle",{cx:100,cy:100,r:5,fill:"var(--ac)"},svg);return{h,m,s}}
  const rot=(e,d)=>e.setAttribute("transform","rotate("+d+" 100 100)");
  function render(card,hands,t,opt){
    const tz=card.dataset.tz,o=parts(tz,t),ms=t%1000,sw=opt.sweep?ms/1000:0,
      s=o.second+sw,m=o.minute+s/60,h=(o.hour%12)+m/60;
    rot(hands.h,h*30);rot(hands.m,m*6);rot(hands.s,s*6);
    const am=o.hour<12,h12=o.hour%12||12,pad=n=>String(n).padStart(2,"0");
    card.querySelector(".digital").innerHTML=opt.h24?pad(o.hour)+":"+pad(o.minute)+(opt.secs?":"+pad(o.second):""):h12+":"+pad(o.minute)+(opt.secs?":"+pad(o.second):"")+"<i>"+(am?"AM":"PM")+"</i>";
    card.querySelector(".date").textContent=new Intl.DateTimeFormat(undefined,{timeZone:tz,weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(t);
    const day=o.hour>=6&&o.hour<18;card.querySelector(".badge").textContent=day?"☀ Daytime":"☾ Night";
  }
  return{build,render,diffHours}
})();
