"use strict";
(()=>{
  const $=s=>document.querySelector(s),root=document.documentElement;
  let S={theme:"dunes",h24:false};
  try{S=Object.assign(S,JSON.parse(localStorage.getItem("uaeph")||"{}"))}catch(e){}
  const save=()=>{try{localStorage.setItem("uaeph",JSON.stringify(S))}catch(e){}};
  const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),2200)};
  window.toast=toast;
  const cards=[...document.querySelectorAll(".card")].map(c=>({c,hands:Clock.build(c.querySelector(".dial"))}));
  const lowPower=()=>S.theme==="amoled";
  function frame(){
    const t=Date.now(),o={h24:S.h24,sweep:!lowPower()&&!matchMedia("(prefers-reduced-motion:reduce)").matches,secs:true};
    cards.forEach(x=>Clock.render(x.c,x.hands,t,o));
    const d=Clock.diffHours(t);$("#diff").textContent="Philippines is "+d+" hours ahead of UAE";
  }
  let raf=0,iv=0;
  function loop(){
    cancelAnimationFrame(raf);clearInterval(iv);if(document.hidden)return;
    if(lowPower()||matchMedia("(prefers-reduced-motion:reduce)").matches){frame();iv=setInterval(frame,1000)}
    else{const f=()=>{frame();raf=requestAnimationFrame(f)};f()}
  }
  document.addEventListener("visibilitychange",loop);
  const sel=$("#theme"),fmt=$("#fmt");sel.value=S.theme;fmt.setAttribute("aria-pressed",S.h24);
  sel.onchange=()=>{S.theme=sel.value;root.dataset.theme=S.theme;save();loop();navigator.vibrate&&navigator.vibrate(10)};
  fmt.onclick=()=>{S.h24=!S.h24;fmt.setAttribute("aria-pressed",S.h24);save();frame()};
  // Wake lock
  let lock=null;const wk=$("#wake");
  async function acquire(){try{lock=await navigator.wakeLock.request("screen");lock.onrelease=()=>{lock=null}}catch(e){wk.setAttribute("aria-pressed","false");toast("Could not keep the screen on")}}
  wk.onclick=async()=>{
    if(!("wakeLock" in navigator)){toast("This browser can't keep the screen on");return}
    if(lock){await lock.release();lock=null;wk.setAttribute("aria-pressed","false")}else{await acquire();wk.setAttribute("aria-pressed",!!lock)}};
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&wk.getAttribute("aria-pressed")==="true"&&!lock)acquire()});
  // Share
  $("#share").onclick=async()=>{
    const data={title:"UAE–PH Clock",text:"Dubai and Manila time, side by side.",url:location.href.split("?")[0]};
    try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);toast("Link copied")}}
    catch(e){if(e.name!=="AbortError")toast("Sharing failed. Copy the address bar link instead.")}};
  $("#help").onclick=()=>$("#dlg").showModal();$("#dlgx").onclick=()=>$("#dlg").close();
  loop();
})();
