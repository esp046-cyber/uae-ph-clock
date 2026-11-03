"use strict";
(()=>{
  const $=s=>document.querySelector(s),root=document.documentElement,C=Clock;
  let S={theme:"dunes",h24:false,view:"side",cities:["Dubai","Manila"]};
  try{Object.assign(S,JSON.parse(localStorage.getItem("uaeph")||"{}"))}catch(e){}
  S.cities=(S.cities||[]).filter((k,i,a)=>C.byName[k]&&a.indexOf(k)===i).slice(0,4);if(S.cities.length<2)S.cities=["Dubai","Manila"];
  const save=()=>{try{localStorage.setItem("uaeph",JSON.stringify(S))}catch(e){}};
  const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2400)};
  const wrap=$("#clocks"),pad=n=>String(n).padStart(2,"0");
  let cards=[],lastSec=-1;
  const reduced=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
  const lowPower=()=>S.theme==="amoled"||reduced();

  function mount(){
    wrap.innerHTML="";root.dataset.n=S.cities.length;wrap.style.setProperty("--n",S.cities.length);
    cards=S.cities.map((k,i)=>{const c=C.byName[k],e=document.createElement("article");e.className="card";
      e.innerHTML='<h2>'+c.name+'<small>'+c.country+' · <span class="utc"></span></small></h2><svg class="dial" viewBox="0 0 200 200" role="img" aria-label="Analog clock, '+c.name+'"></svg><p class="digital"></p><p class="date"></p><p class="badge"></p><div class="acts"><button data-a="c" data-i="'+i+'">Change</button>'+(S.cities.length>2?'<button data-a="d" data-i="'+i+'" aria-label="Remove '+c.name+'">✕</button>':"")+'</div>';
      wrap.appendChild(e);return{e,c,off:0,hd:C.build(e.querySelector(".dial"))}});
    lastSec=-1;
  }
  function text(x,t){
    const dm=C.dayMs(t+x.off),H=Math.floor(dm/36e5),M=Math.floor(dm/6e4)%60,Sx=Math.floor(dm/1e3)%60,secs=S.view==="stack"||!matchMedia("(max-width:720px)").matches;
    const core=S.h24?pad(H)+":"+pad(M):((H%12)||12)+":"+pad(M),sc=secs?":"+pad(Sx):"";
    x.e.querySelector(".digital").innerHTML=core+sc+(S.h24?"":"<i>"+(H<12?"AM":"PM")+"</i>");
    x.e.querySelector(".date").textContent=C.dateStr(x.c.tz,t);
    x.e.querySelector(".badge").textContent=(H>=6&&H<18)?"☀ Day":"☾ Night";
    x.e.querySelector(".utc").textContent=C.utcLabel(x.off)}
  function summary(){
    const [a,b]=cards;
    $("#diff").textContent=C.diffText(a.c,b.c,a.off,b.off);
    const o=C.overlap(a.off/6e4,b.off/6e4),f=m=>C.fmtMin(m,S.h24);
    $("#overlap").textContent=o?"Overlap (9–5): "+a.c.name+" "+f(o.a[0])+" – "+f(o.a[1])+" / "+b.c.name+" "+f(o.b[0])+" – "+f(o.b[1]):"No 9–5 business-hour overlap between "+a.c.name+" and "+b.c.name;
    scrub()}
  function frame(){
    const t=Date.now(),sec=Math.floor(t/1e3),sweep=!lowPower();
    if(sec!==lastSec){lastSec=sec;cards.forEach(x=>{x.off=C.offMs(x.c.tz,t);text(x,t)});summary()}
    cards.forEach(x=>C.hands(x.hd,t+x.off,sweep))}
  let raf=0,iv=0;
  function loop(){cancelAnimationFrame(raf);clearInterval(iv);if(document.hidden)return;
    if(lowPower()){frame();iv=setInterval(frame,1000)}else{const f=()=>{frame();raf=requestAnimationFrame(f)};f()}}
  document.addEventListener("visibilitychange",loop);

  // Meeting planner: slider = time of day in the first city
  const sl=$("#slider");let touched=false;
  function scrub(){
    if(!cards.length)return;const base=cards[0],v=+sl.value;
    if(!touched){const dm=C.dayMs(Date.now()+base.off);sl.value=Math.round(dm/9e5)*15%1440}
    const m0=+sl.value,utc=m0-base.off/6e4;
    $("#sOut").innerHTML=cards.map(x=>{const l=utc+x.off/6e4,d=Math.floor(l/1440);return'<li><b>'+x.c.name+'</b> <span>'+C.fmtMin(l,S.h24)+(d?' <em>'+(d>0?"+1 day":"−1 day")+'</em>':"")+'</span></li>'}).join("")}
  sl.oninput=()=>{touched=true;scrub()};
  $("#sNow").onclick=()=>{touched=false;scrub()};
  $("#plan").onclick=()=>{const p=$("#planner");p.open=!p.open;if(p.open)p.scrollIntoView({behavior:"smooth",block:"nearest"})};

  // Controls
  const sel=$("#theme"),fmt=$("#fmt"),vw=$("#view");
  const setView=()=>{root.dataset.view=S.view;vw.textContent=S.view==="side"?"Side-by-Side (Compact)":"Stacked (Large)"};
  sel.value=S.theme;fmt.setAttribute("aria-pressed",S.h24);setView();
  sel.onchange=()=>{S.theme=sel.value;root.dataset.theme=S.theme;save();loop()};
  fmt.onclick=()=>{S.h24=!S.h24;fmt.setAttribute("aria-pressed",S.h24);save();lastSec=-1;frame()};
  vw.onclick=()=>{S.view=S.view==="side"?"stack":"side";setView();save();lastSec=-1;frame()};
  addEventListener("resize",()=>{lastSec=-1});

  // City picker
  const cd=$("#cityDlg"),q=$("#q"),list=$("#cityList");let target="add";
  function openPicker(t){target=t;$("#cityHint").textContent=t==="add"?"Adding clock "+(S.cities.length+1)+" of 4":"Replacing "+S.cities[t];q.value="";renderList();cd.showModal();q.focus()}
  function renderList(){
    const k=q.value.trim().toLowerCase();let html="",reg="";
    C.CITIES.forEach(c=>{if(k&&!(c.name+" "+c.country+" "+c.tz+" "+c.region).toLowerCase().includes(k))return;
      if(c.region!==reg){reg=c.region;html+='<li class="rg">'+reg+'</li>'}
      html+='<li><button data-n="'+c.name+'"'+(S.cities.includes(c.name)?" disabled":"")+'>'+c.name+' <small>'+c.country+'</small></button></li>'});
    list.innerHTML=html||'<li class="rg">No match. Try a city or country name.</li>'}
  q.oninput=renderList;
  list.onclick=e=>{const b=e.target.closest("button[data-n]");if(!b)return;
    if(target==="add")S.cities.push(b.dataset.n);else S.cities[target]=b.dataset.n;
    save();cd.close();mount();touched=false;frame()};
  $("#add").onclick=()=>openPicker(S.cities.length<4?"add":S.cities.length-1);
  $("#cityX").onclick=()=>cd.close();
  wrap.onclick=e=>{const b=e.target.closest("button[data-a]");if(!b)return;const i=+b.dataset.i;
    if(b.dataset.a==="c")openPicker(i);else{S.cities.splice(i,1);save();mount();frame()}};

  // Wake lock
  let lock=null;const wk=$("#wake");
  async function acquire(){try{lock=await navigator.wakeLock.request("screen");lock.onrelease=()=>{lock=null}}catch(e){wk.setAttribute("aria-pressed","false");toast("Could not keep the screen on")}}
  wk.onclick=async()=>{if(!("wakeLock" in navigator)){toast("This browser can't keep the screen on");return}
    if(lock){await lock.release();lock=null;wk.setAttribute("aria-pressed","false")}else{await acquire();wk.setAttribute("aria-pressed",!!lock)}};
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&wk.getAttribute("aria-pressed")==="true"&&!lock)acquire()});
  // Share
  $("#share").onclick=async()=>{const d={title:"UAE–PH Clock",text:"World clocks side by side.",url:location.href.split("?")[0]};
    try{if(navigator.share)await navigator.share(d);else{await navigator.clipboard.writeText(d.url);toast("Link copied")}}catch(e){if(e.name!=="AbortError")toast("Sharing failed. Copy the address bar link instead.")}};
  $("#help").onclick=()=>$("#dlg").showModal();$("#dlgx").onclick=()=>$("#dlg").close();
  mount();loop();
})();
