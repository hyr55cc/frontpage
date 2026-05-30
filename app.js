/* ============================================================
   app.js — UI helpers, particles, init, wiring, PWA
   ============================================================ */
const UI = (() => {
  const drawer=()=>document.getElementById("drawer");
  const scrim=()=>document.getElementById("scrim");
  const mScrim=()=>document.getElementById("modalScrim");

  function openDrawer(){ drawer().classList.add("open"); scrim().classList.add("open"); drawer().setAttribute("aria-hidden","false"); }
  function closeDrawer(){ drawer().classList.remove("open"); scrim().classList.remove("open"); drawer().setAttribute("aria-hidden","true"); }
  function modal(title, html){
    document.getElementById("modalTitle").textContent=title;
    document.getElementById("modalBody").innerHTML=html;
    mScrim().classList.add("open");
    document.getElementById("modal").querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal);
    const first=document.getElementById("modalBody").querySelector("input"); if(first) setTimeout(()=>first.focus(),60);
  }
  function closeModal(){ mScrim().classList.remove("open"); }
  let toastTo;
  function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastTo); toastTo=setTimeout(()=>t.classList.remove("show"),2200); }
  return { openDrawer, closeDrawer, modal, closeModal, toast };
})();

/* ---------------- particles ---------------- */
const Particles = (() => {
  let cv, ctx, parts=[], raf, W, H, mouse={x:-999,y:-999};
  function resize(){ W=cv.width=innerWidth*devicePixelRatio; H=cv.height=innerHeight*devicePixelRatio; cv.style.width=innerWidth+"px"; cv.style.height=innerHeight+"px"; }
  function init(){
    cv=document.getElementById("particles"); ctx=cv.getContext("2d"); resize();
    const count=Math.min(70, Math.floor(innerWidth/22));
    parts=Array.from({length:count},()=>({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.25*devicePixelRatio, vy:(Math.random()-.5)*.25*devicePixelRatio, r:(Math.random()*1.6+.4)*devicePixelRatio }));
    addEventListener("resize",resize);
    addEventListener("pointermove",e=>{ mouse.x=e.clientX*devicePixelRatio; mouse.y=e.clientY*devicePixelRatio; });
    loop();
  }
  function loop(){
    if (matchMedia("(prefers-reduced-motion:reduce)").matches){ return; }
    ctx.clearRect(0,0,W,H);
    const accent=getComputedStyle(document.body).getPropertyValue("--accent").trim()||"#7c9cff";
    for(const p of parts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
      const dx=p.x-mouse.x, dy=p.y-mouse.y, d=Math.hypot(dx,dy);
      if(d<120*devicePixelRatio){ p.x+=dx/d*.6; p.y+=dy/d*.6; }
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fillStyle=accent; ctx.globalAlpha=.5; ctx.fill();
    }
    // links
    ctx.globalAlpha=.12; ctx.strokeStyle=accent; ctx.lineWidth=devicePixelRatio;
    for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){
      const a=parts[i],b=parts[j],dd=Math.hypot(a.x-b.x,a.y-b.y);
      if(dd<110*devicePixelRatio){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
    }
    ctx.globalAlpha=1;
    raf=requestAnimationFrame(loop);
  }
  return { init };
})();

/* ---------------- App ---------------- */
const App = (() => {
  function applyState(s){
    Themes.applyAll(s);
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute("content", getComputedStyle(document.body).getPropertyValue("--bg").trim());
  }

  function refreshAll(){
    const s=Store.get();
    I18N.apply(s.lang);
    applyState(s);
    Clock.refresh();
    Search.render();
    Bookmarks.renderAll();
    Widgets.render();
    Settings.render();
  }

  function init(){
    const s=Store.get();
    I18N.apply(s.lang);
    applyState(s);

    Clock.start();
    Particles.init();
    Search.render();
    Search.initHotkeys();
    Bookmarks.renderAll();
    Widgets.render();

    // live re-apply theme/vars/background whenever state changes
    Store.subscribe(applyState);

    wire();

    // boot fade
    setTimeout(()=>document.getElementById("boot").classList.add("gone"),520);

    // PWA
    if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }
  }

  function wire(){
    document.getElementById("openSettings").onclick=()=>Settings.open();
    document.getElementById("closeSettings").onclick=UI.closeDrawer;
    document.getElementById("scrim").onclick=UI.closeDrawer;
    document.getElementById("modalScrim").onclick=e=>{ if(e.target.id==="modalScrim") UI.closeModal(); };
    document.getElementById("modalClose").onclick=UI.closeModal;
    document.getElementById("themeQuick").onclick=Themes.cycle;
    document.getElementById("viewToggle").onclick=Bookmarks.toggleView;
    document.getElementById("addEngine").onclick=()=>Search.openEngineModal(null);
    document.getElementById("addCategory").onclick=Bookmarks.addCategory;
    document.getElementById("langToggle").onclick=()=>{
      const next=Store.get().lang==="ar"?"en":"ar";
      Store.set({lang:next}); refreshAll();
    };
    document.querySelectorAll("#drawerTabs button").forEach(b=>b.onclick=()=>Settings.setTab(b.dataset.tab));
  }

  return { init, refreshAll };
})();

document.addEventListener("DOMContentLoaded", App.init);
