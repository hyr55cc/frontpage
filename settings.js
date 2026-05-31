/* ============================================================
   settings.js — settings drawer panels
   ============================================================ */
const Settings = (() => {
  let body, current = "appearance";

  function open(tab){ if (tab){ current = tab; document.querySelectorAll("#drawerTabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab)); } render(); UI.openDrawer(); }
  function setTab(tab){ current = tab; document.querySelectorAll("#drawerTabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab)); render(); }

  function render(){
    body = document.getElementById("drawerBody");
    body.innerHTML = ({ appearance:appearancePanel, background:backgroundPanel, widgets:widgetsPanel, data:dataPanel })[current]();
    ({ appearance:wireAppearance, background:wireBackground, widgets:wireWidgets, data:wireData })[current]();
  }

  /* ---------- APPEARANCE ---------- */
  function appearancePanel(){
    const s = Store.get();
    return `
      <div class="field"><label>${I18N.t("theme")}</label>
        <div class="theme-row">${Themes.LIST.map(t=>`
          <button class="theme-chip ${t===s.theme?'active':''}" data-theme-pick="${t}" style="background:${chipBg(t)}"><span>${Themes.NAMES[t]}</span></button>`).join("")}</div>
      </div>
      <div class="field"><label>${I18N.t("accent")}</label>
        <div class="swatch-row">
          <button class="swatch ${!s.accent?'active':''}" data-accent="" style="background:linear-gradient(135deg,var(--accent),var(--accent-2))" title="Theme default"></button>
          ${Themes.ACCENTS.map(c=>`<button class="swatch ${s.accent===c?'active':''}" data-accent="${c}" style="background:${c}"></button>`).join("")}
        </div>
      </div>
      <div class="field"><label>${I18N.t("uiFont")}</label>
        <div class="seg">${Object.entries(Themes.FONTS).map(([k,v])=>`<button class="${s.uiFont===k?'active':''}" data-font="${k}">${v}</button>`).join("")}</div>
      </div>
      <div class="field"><label>${I18N.t("bmViewLabel")}</label>
        <div class="seg"><button class="${s.bmView==='grid'?'active':''}" data-view="grid">${I18N.t("grid")}</button><button class="${s.bmView==='list'?'active':''}" data-view="list">${I18N.t("list")}</button><button class="${s.bmView==='folder'?'active':''}" data-view="folder">${I18N.t("folder")}</button></div>
      </div>
      <div class="toggle-row"><span class="t-name">${I18N.t("suggestions")}</span><button class="switch ${s.suggest?'on':''}" data-suggest></button></div>
      <div class="field"><label>${I18N.t("glassBlur")} · ${s.glassBlur}px</label><input type="range" class="slider" min="0" max="40" value="${s.glassBlur}" data-blur></div>
      <div class="field"><label>${I18N.t("cardOpacity")} · ${Math.round(s.cardAlpha*100)}%</label><input type="range" class="slider" min="30" max="100" value="${s.cardAlpha*100}" data-alpha></div>
      <div class="field"><label>${I18N.t("corners")} · ${Math.round(s.radiusScale*100)}%</label><input type="range" class="slider" min="40" max="160" value="${s.radiusScale*100}" data-radius></div>`;
  }
  function chipBg(t){
    const m={aurora:"radial-gradient(120% 120% at 15% 0%,#1a1b3a,#0a0a18)",light:"#eef1ff",dark:"#161a24",amoled:"#000",
      glass:"linear-gradient(135deg,#3a2b6e,#2b8a9c)",cyber:"radial-gradient(120% 120% at 80% 0%,#2a0040,#06000c)",
      midnight:"radial-gradient(120% 120% at 25% 0%,#10224d,#050a1c)",vision:"radial-gradient(130% 130% at 50% -10%,#34384a,#15171f)",
      minimal:"#f3f3f3",luxury:"linear-gradient(135deg,#241c0e,#0a0805)"};
    return m[t]||"#222";
  }
  function wireAppearance(){
    q("[data-theme-pick]",true).forEach(b=>b.onclick=()=>{Store.set({theme:b.dataset.themePick});render();});
    q("[data-accent]",true).forEach(b=>b.onclick=()=>{Store.set({accent:b.dataset.accent});render();});
    q("[data-font]",true).forEach(b=>b.onclick=()=>{Store.set({uiFont:b.dataset.font});render();});
    q("[data-view]",true).forEach(b=>b.onclick=()=>{Store.set({bmView:b.dataset.view});Bookmarks.renderAll();render();});
    const sug=q("[data-suggest]"); if(sug) sug.onclick=()=>{Store.update(s=>s.suggest=!s.suggest);sug.classList.toggle("on");};
    q("[data-blur]").oninput=e=>{Store.set({glassBlur:+e.target.value});liveLabel(e,"px");};
    q("[data-alpha]").oninput=e=>{Store.set({cardAlpha:+e.target.value/100});liveLabel(e,"%",true);};
    q("[data-radius]").oninput=e=>{Store.set({radiusScale:+e.target.value/100});liveLabel(e,"%",true);};
  }
  function liveLabel(e,unit,pct){ const v=pct?e.target.value:e.target.value; e.target.previousElementSibling.textContent=e.target.previousElementSibling.textContent.replace(/·.*/,"· "+(unit==="%"?Math.round(v):v)+unit); }

  /* ---------- BACKGROUND ---------- */
  function backgroundPanel(){
    const s=Store.get(), b=s.background;
    return `
      <div class="field"><label>${I18N.t("bgMode")}</label>
        <div class="seg"><button class="${b.mode==='gradient'?'active':''}" data-bgmode="gradient">${I18N.t("gradient")}</button><button class="${b.mode==='animated'?'active':''}" data-bgmode="animated">${I18N.t("animated")}</button><button class="${b.mode==='solid'?'active':''}" data-bgmode="solid">${I18N.t("solid")}</button><button class="${b.mode==='image'?'active':''}" data-bgmode="image">${I18N.t("image")}</button></div>
      </div>
      <div class="field"><label>${I18N.t("gradient")}</label>
        <div class="grad-row">${Themes.GRADIENTS.map((g,i)=>`<button class="grad-chip ${b.gradient===i&&b.mode==='gradient'?'active':''}" data-grad="${i}" style="background:${g}"></button>`).join("")}</div>
      </div>
      <div class="field"><label>${I18N.t("animated")}</label>
        <div class="seg">${Themes.ANIM.map(a=>`<button class="${b.anim===a&&b.mode==='animated'?'active':''}" data-anim="${a}">${I18N.t("anim"+a.charAt(0).toUpperCase()+a.slice(1))}</button>`).join("")}</div>
      </div>
      <div class="toggle-row"><span class="t-name">${I18N.t("dailyRotate")}</span><button class="switch ${b.daily?'on':''}" data-daily></button></div>
      <div class="field" style="margin-top:18px"><label>${I18N.t("image")}</label>
        <div class="upload-zone" id="bgUpload">${b.image?'🖼️ '+(I18N.lang==='ar'?'تغيير الصورة':'Change image'):I18N.t("uploadHint")}</div>
        <input type="file" id="bgFile" accept="image/*" hidden>
      </div>
      <div class="field"><label>${I18N.t("blur")} · ${b.blur}px</label><input type="range" class="slider" min="0" max="30" value="${b.blur}" data-bgblur></div>
      <div class="field"><label>${I18N.t("brightness")} · ${Math.round(b.bright*100)}%</label><input type="range" class="slider" min="30" max="130" value="${b.bright*100}" data-bgbright></div>
      <div class="field"><label>${I18N.t("saturation")} · ${Math.round((b.sat==null?1:b.sat)*100)}%</label><input type="range" class="slider" min="0" max="200" value="${(b.sat==null?1:b.sat)*100}" data-bgsat></div>`;
  }
  function wireBackground(){
    q("[data-bgmode]",true).forEach(b=>b.onclick=()=>{Store.update(s=>s.background.mode=b.dataset.bgmode);render();});
    q("[data-grad]",true).forEach(b=>b.onclick=()=>{Store.update(s=>{s.background.gradient=+b.dataset.grad;s.background.mode="gradient";s.background.daily=false;});render();});
    q("[data-anim]",true).forEach(b=>b.onclick=()=>{Store.update(s=>{s.background.anim=b.dataset.anim;s.background.mode="animated";});render();});
    q("[data-daily]").onclick=e=>{Store.update(s=>s.background.daily=!s.background.daily);render();};
    q("[data-bgblur]").oninput=e=>{Store.update(s=>s.background.blur=+e.target.value);liveLabel(e,"px");};
    q("[data-bgbright]").oninput=e=>{Store.update(s=>s.background.bright=+e.target.value/100);liveLabel(e,"%",true);};
    q("[data-bgsat]").oninput=e=>{Store.update(s=>s.background.sat=+e.target.value/100);liveLabel(e,"%",true);};
    const file=q("#bgFile");
    q("#bgUpload").onclick=()=>file.click();
    file.onchange=()=>{
      const f=file.files[0]; if(!f)return;
      if(f.size>3.5*1024*1024){ UI.toast(I18N.lang==="ar"?"الصورة كبيرة (<3.5MB)":"Image too large (<3.5MB)"); return; }
      const r=new FileReader();
      r.onload=()=>{ Store.update(s=>{s.background.image=r.result;s.background.mode="image";}); render(); };
      r.readAsDataURL(f);
    };
  }

  /* ---------- WIDGETS ---------- */
  function widgetsPanel(){
    const s=Store.get(); const w=s.widgets;
    const labels={weather:"weather",prayer:"prayer",todo:"todo",notes:"notes",calendar:"calendar",pomodoro:"pomodoro",worldclock:"worldclock",crypto:"crypto",stocks:"stocks",calculator:"calculator"};
    let html = `<p class="hint" style="margin-bottom:12px">${I18N.t("reorderHint")}</p>`;
    html += Object.keys(labels).map(k=>`
      <div class="toggle-row"><span class="t-name">${I18N.t(labels[k])}</span><button class="switch ${w[k]?'on':''}" data-widget="${k}"></button></div>`).join("");
    if (w.todo){
      html += `
      <div class="field" style="margin-top:14px"><label>🔔 ${I18N.t("alertSound")}</label>
        <div class="seg sound-seg">${Notify.SOUNDS.map(snd=>`<button class="${s.alertSound===snd?'active':''}" data-sound="${snd}">${snd}</button>`).join("")}</div>
        <button class="btn btn-soft" id="soundTest" style="margin-top:8px">▶ ${I18N.t("testSound")}</button>
      </div>`;
    }
    if (w.stocks){
      html += `
      <div class="field" style="margin-top:14px"><label>🇺🇸 ${I18N.lang==='ar'?'رموز أمريكية (مفصولة بفاصلة)':'US symbols (comma separated)'}</label>
        <input id="usSyms" value="${s.stockSymbols.join(', ')}" placeholder="AAPL, MSFT, NVDA"></div>
      <div class="field"><label>🇸🇦 ${I18N.lang==='ar'?'أرقام أسهم سعودية (مثل 2222)':'Saudi codes (e.g. 2222)'}</label>
        <input id="saSyms" value="${s.saudiSymbols.join(', ')}" placeholder="2222, 1120, 7010"></div>
      <div class="field"><label>🔑 ${I18N.t("finnhubKey")}</label>
        <input id="fhKey" value="${esc(s.finnhubKey||'')}" placeholder="d0xxxx..." autocomplete="off">
        <p class="hint" style="margin-top:6px">${I18N.t("finnhubHint")} · <a href="https://finnhub.io/register" target="_blank" rel="noopener" style="color:var(--accent)">finnhub.io/register ↗</a></p></div>`;
    }
    return html;
  }
  function wireWidgets(){
    q("[data-widget]",true).forEach(b=>b.onclick=()=>{
      const k=b.dataset.widget;
      Store.update(s=>s.widgets[k]=!s.widgets[k]);
      b.classList.toggle("on"); Widgets.render();
      if(k==="stocks"||k==="todo") render(); // show/hide extra fields
    });
    q("[data-sound]",true).forEach(b=>b.onclick=()=>{
      Store.set({alertSound:b.dataset.sound});
      q("[data-sound]",true).forEach(x=>x.classList.toggle("active",x===b));
      Notify.play(b.dataset.sound);
    });
    const st=q("#soundTest"); if(st) st.onclick=()=>Notify.play(Store.get().alertSound);
    const us=q("#usSyms"); if(us) us.onchange=()=>{
      Store.set({stockSymbols: us.value.split(",").map(x=>x.trim().toUpperCase()).filter(Boolean)}); Widgets.render();
    };
    const sa=q("#saSyms"); if(sa) sa.onchange=()=>{
      Store.set({saudiSymbols: sa.value.split(",").map(x=>x.trim()).filter(Boolean)}); Widgets.render();
    };
    const fh=q("#fhKey"); if(fh) fh.onchange=()=>{ Store.set({finnhubKey:fh.value.trim()}); Widgets.render(); };
  }

  /* ---------- DATA ---------- */
  function dataPanel(){
    return `
      <p class="hint" style="margin-bottom:16px">${I18N.t("footHint")}.</p>
      <div class="data-actions">
        <button class="btn btn-soft" id="dataExport">⬇️ ${I18N.t("exportData")}</button>
        <button class="btn btn-soft" id="dataImport">⬆️ ${I18N.t("importData")}</button>
        <input type="file" id="dataFile" accept="application/json" hidden>
        <button class="btn btn-danger" id="dataReset">♻️ ${I18N.t("reset")}</button>
      </div>`;
  }
  function wireData(){
    q("#dataExport").onclick=()=>{
      const blob=new Blob([Store.export()],{type:"application/json"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="lumen-backup.json"; a.click();
    };
    const file=q("#dataFile");
    q("#dataImport").onclick=()=>file.click();
    file.onchange=()=>{ const f=file.files[0]; if(!f)return; const r=new FileReader();
      r.onload=()=>{ if(Store.import(r.result)){ UI.toast(I18N.t("imported")); App.refreshAll(); } else UI.toast(I18N.t("importFail")); };
      r.readAsText(f); };
    q("#dataReset").onclick=()=>{ if(confirm(I18N.t("deleteConfirm"))){ Store.reset(); App.refreshAll(); UI.closeDrawer(); } };
  }

  const q=(sel,all)=> all ? Array.from(body.querySelectorAll(sel)) : body.querySelector(sel);
  const esc = s => String(s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;");
  return { open, setTab, render };
})();
