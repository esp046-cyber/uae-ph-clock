"use strict";
const Clock=(()=>{
  const NS="http://www.w3.org/2000/svg",fp={},fd={};
  const L=(region,rows)=>rows.map(r=>({region,name:r[0],country:r[1],tz:r[2]}));
  const CITIES=[].concat(
    L("Middle East",[["Dubai","UAE","Asia/Dubai"],["Abu Dhabi","UAE","Asia/Dubai"],["Riyadh","Saudi Arabia","Asia/Riyadh"],["Doha","Qatar","Asia/Qatar"],["Kuwait City","Kuwait","Asia/Kuwait"],["Manama","Bahrain","Asia/Bahrain"],["Muscat","Oman","Asia/Muscat"]]),
    L("Asia-Pacific",[["Manila","Philippines","Asia/Manila"],["Tokyo","Japan","Asia/Tokyo"],["Singapore","Singapore","Asia/Singapore"],["Hong Kong","Hong Kong","Asia/Hong_Kong"],["Seoul","South Korea","Asia/Seoul"],["Sydney","Australia","Australia/Sydney"],["Auckland","New Zealand","Pacific/Auckland"],["New Delhi","India","Asia/Kolkata"],["Bangkok","Thailand","Asia/Bangkok"],["Jakarta","Indonesia","Asia/Jakarta"],["Kuala Lumpur","Malaysia","Asia/Kuala_Lumpur"],["Hanoi","Vietnam","Asia/Ho_Chi_Minh"],["Taipei","Taiwan","Asia/Taipei"],["Beijing","China","Asia/Shanghai"],["Karachi","Pakistan","Asia/Karachi"],["Colombo","Sri Lanka","Asia/Colombo"]]),
    L("Europe",[["London","UK","Europe/London"],["Paris","France","Europe/Paris"],["Berlin","Germany","Europe/Berlin"],["Rome","Italy","Europe/Rome"],["Madrid","Spain","Europe/Madrid"],["Amsterdam","Netherlands","Europe/Amsterdam"],["Zurich","Switzerland","Europe/Zurich"],["Dublin","Ireland","Europe/Dublin"],["Stockholm","Sweden","Europe/Stockholm"],["Athens","Greece","Europe/Athens"],["Warsaw","Poland","Europe/Warsaw"],["Istanbul","Turkey","Europe/Istanbul"],["Moscow","Russia","Europe/Moscow"]]),
    L("Americas",[["New York","USA","America/New_York"],["Los Angeles","USA","America/Los_Angeles"],["Chicago","USA","America/Chicago"],["Miami","USA","America/New_York"],["Denver","USA","America/Denver"],["Honolulu","USA","Pacific/Honolulu"],["Toronto","Canada","America/Toronto"],["Vancouver","Canada","America/Vancouver"],["São Paulo","Brazil","America/Sao_Paulo"],["Mexico City","Mexico","America/Mexico_City"],["Buenos Aires","Argentina","America/Argentina/Buenos_Aires"],["Bogotá","Colombia","America/Bogota"],["Santiago","Chile","America/Santiago"]]),
    L("Africa",[["Cairo","Egypt","Africa/Cairo"],["Johannesburg","South Africa","Africa/Johannesburg"],["Lagos","Nigeria","Africa/Lagos"],["Nairobi","Kenya","Africa/Nairobi"]]));
  const byName={};CITIES.forEach(c=>byName[c.name]=c);
  const el=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
  function offMs(tz,t){ // exact IANA offset via Intl, DST-aware
    const f=fp[tz]||(fp[tz]=new Intl.DateTimeFormat("en-GB",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}));
    const o={};f.formatToParts(t).forEach(p=>o[p.type]=+p.value);
    return Date.UTC(o.year,o.month-1,o.day,o.hour,o.minute,o.second)-Math.floor(t/1000)*1000}
  const dateStr=(tz,t)=>(fd[tz]||(fd[tz]=new Intl.DateTimeFormat(undefined,{timeZone:tz,weekday:"short",day:"numeric",month:"short",year:"numeric"}))).format(t);
  const dayMs=lm=>((lm%864e5)+864e5)%864e5;
  const utcLabel=o=>{const m=Math.round(o/6e4),s=m<0?"-":"+",a=Math.abs(m);return"UTC"+s+Math.floor(a/60)+(a%60?":"+String(a%60).padStart(2,"0"):"")};
  const fmtMin=(m,h24)=>{m=((m%1440)+1440)%1440;const h=Math.floor(m/60),mm=String(m%60).padStart(2,"0");return h24?String(h).padStart(2,"0")+":"+mm:((h%12)||12)+":"+mm+" "+(h<12?"AM":"PM")};
  function diffText(a,b,offA,offB){ // a,b city objects; offsets in ms
    const d=(offB-offA)/36e5;if(!d)return a.name+" and "+b.name+" are on the same time";
    const ahead=d>0?b:a,behind=d>0?a:b,x=Math.abs(d),h=Math.floor(x),m=Math.round((x-h)*60);
    return ahead.name+" is +"+h+"h"+(m?" "+m+"m":"")+" ahead of "+behind.name}
  function overlap(offA,offB,ws=540,we=1020){ // offsets in minutes; returns local-minute windows or null
    let best=null;
    for(let k=-1;k<=1;k++){const aS=ws-offA,aE=we-offA,bS=ws-offB+1440*k,bE=we-offB+1440*k,s=Math.max(aS,bS),e=Math.min(aE,bE);
      if(e>s&&(!best||e-s>best.e-best.s))best={s,e}}
    return best&&{a:[best.s+offA,best.e+offA],b:[best.s+offB,best.e+offB]}}
  function build(svg){
    el("circle",{class:"bezel",cx:100,cy:100,r:94},svg);el("circle",{class:"face",cx:100,cy:100,r:90},svg);
    for(let i=0;i<60;i++){const big=i%5===0,a=i*Math.PI/30,r1=big?76:83;
      el("line",{class:"tick"+(i%15===0?" big":""),x1:100+r1*Math.sin(a),y1:100-r1*Math.cos(a),x2:100+86*Math.sin(a),y2:100-86*Math.cos(a),"stroke-width":big?3:1},svg)}
    return{h:el("line",{class:"hand",x1:100,y1:100,x2:100,y2:56,"stroke-width":6},svg),m:el("line",{class:"hand",x1:100,y1:100,x2:100,y2:34,"stroke-width":4},svg),
      s:(el("line",{class:"hand sec",x1:100,y1:114,x2:100,y2:24,"stroke-width":1.6},svg),svg.lastChild),dot:el("circle",{cx:100,cy:100,r:5,fill:"var(--ac)"},svg)}}
  function hands(hd,lm,sweep){
    let d=dayMs(lm);if(!sweep)d=Math.floor(d/1e3)*1e3;
    const s=(d/1e3)%60,m=(d/6e4)%60,h=(d/36e5)%12;
    hd.h.style.transform="rotate("+h*30+"deg)";hd.m.style.transform="rotate("+m*6+"deg)";hd.s.style.transform="rotate("+s*6+"deg)"}
  return{CITIES,byName,offMs,dateStr,dayMs,utcLabel,fmtMin,diffText,overlap,build,hands}
})();
if(typeof module!=="undefined")module.exports=Clock;
