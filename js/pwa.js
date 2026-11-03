"use strict";
(()=>{
  if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
  const b=document.getElementById("installBanner"),btn=document.getElementById("installBtn"),msg=document.getElementById("installMsg");
  const standalone=matchMedia("(display-mode:standalone)").matches||navigator.standalone;
  const dismissed=()=>{try{return sessionStorage.getItem("noInstall")}catch(e){return null}};
  document.getElementById("installX").onclick=()=>{b.hidden=true;try{sessionStorage.setItem("noInstall","1")}catch(e){}};
  let ev=null;
  addEventListener("beforeinstallprompt",e=>{e.preventDefault();ev=e;if(!standalone&&!dismissed())b.hidden=false});
  btn.onclick=async()=>{if(ev){ev.prompt();await ev.userChoice;ev=null;b.hidden=true}else document.getElementById("dlg").showModal()};
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  if(ios&&!standalone&&!dismissed()){msg.textContent="On iPhone: tap Share, then Add to Home Screen.";btn.textContent="Show me";b.hidden=false}
  addEventListener("appinstalled",()=>{b.hidden=true});
})();
