/* ============================================================
   search.js — multi search engines, custom CRUD, reorder,
               hotkeys, live suggestions
   ============================================================ */
const Search = (() => {
  let rail, dragId = null, sugTimer = null, sugBox = null, sugItems = [], sugSel = -1, sugCtx = null;

  function favicon(url){
    try { const h = new URL(url.replace("%s","x")).hostname; return `https://www.google.com/s2/favicons?domain=${h}&sz=64`; }
    catch { return ""; }
  }

  /* ---- JSONP suggestion fetch (DuckDuckGo autocomplete, keyless) ---- */
  function fetchSuggest(q, cb){
    if (!q) return cb([]);
    const name = "__lumenSug" + Date.now();
    const s = document.createElement("script");
    let done = false;
    const cleanup = () => { try{ delete window[name]; }catch{ window[name]=undefined; } s.remove(); };
    window[name] = (data) => {
      done = true;
      let out = [];
      try {
        if (Array.isArray(data)){
          if (Array.isArray(data[1])) out = data[1];            // [q,[...]]
          else out = data.map(x => x && x.phrase ? x.phrase : x); // [{phrase}]
        }
      } catch {}
      cleanup();
      cb(out.filter(x => typeof x === "string").slice(0, 7));
    };
    s.onerror = () => { cleanup(); cb([]); };
    s.src = `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list&callback=${name}`;
    document.body.appendChild(s);
    setTimeout(() => { if (!done){ cleanup(); cb([]); } }, 2500);
  }

  function render(){
    rail = document.getElementById("searchRail");
    const engines = Store.get().engines;
    rail.innerHTML = "";
    closeSug();
    engines.forEach((e, i) => {
      const el = document.createElement("div");
      el.className = "engine";
      el.draggable = true;
      el.dataset.id = e.id;
      el.style.setProperty("--accent", e.color);
      const fav = favicon(e.url);
      el.innerHTML = `
        ${i < 9 ? `<span class="engine-kbd">Alt+${i+1}</span>` : ""}
        <button class="engine-menu icon-btn" title="Edit" data-edit style="width:26px;height:26px;border:none;background:none">
          <svg viewBox="0 0 24 24" class="ic" style="width:14px;height:14px"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        </button>
        <div class="engine-ico">${fav ? `<img src="${fav}" alt="" onerror="this.replaceWith(document.createTextNode('${(e.icon||e.name[0]).slice(0,2)}'))">` : (e.icon||e.name[0]).slice(0,2)}</div>
        <input type="text" placeholder="${searchPlaceholder(e.name)}" aria-label="${e.name}" autocomplete="off" />
        <button class="engine-go" title="Search ${e.name}"><svg viewBox="0 0 24 24" class="ic" style="width:17px;height:17px"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>`;

      const input = el.querySelector("input");
      const go = (q) => doSearch(e.url, q != null ? q : input.value);
      input.addEventListener("keydown", ev => onKey(ev, input, e, go));
      input.addEventListener("input", () => onInput(input, el, e, go));
      input.addEventListener("focus", () => { el.classList.add("focused"); });
      input.addEventListener("blur",  () => { el.classList.remove("focused"); setTimeout(closeSug, 140); });
      el.querySelector(".engine-go").addEventListener("click", () => go());
      el.querySelector("[data-edit]").addEventListener("click", (ev) => { ev.stopPropagation(); openEngineModal(e.id); });

      el.addEventListener("dragstart", () => { dragId = e.id; el.classList.add("dragging"); });
      el.addEventListener("dragend",   () => { dragId = null; el.classList.remove("dragging"); });
      el.addEventListener("dragover",  ev => ev.preventDefault());
      el.addEventListener("drop", ev => { ev.preventDefault(); reorder(dragId, e.id); });

      rail.appendChild(el);
    });
  }

  function onInput(input, el, e, go){
    if (!Store.get().suggest) return;
    const q = input.value.trim();
    clearTimeout(sugTimer);
    if (q.length < 2){ closeSug(); return; }
    sugTimer = setTimeout(() => {
      fetchSuggest(q, list => {
        if (document.activeElement !== input) return;
        showSug(el, list, go);
      });
    }, 150);
  }

  function showSug(el, list, go){
    closeSug();
    if (!list.length) return;
    sugItems = list; sugSel = -1; sugCtx = go;
    sugBox = document.createElement("div");
    sugBox.className = "engine-sug";
    sugBox.innerHTML = list.map((t,i)=>`<button class="sug-row" data-i="${i}">
      <svg viewBox="0 0 24 24" class="ic" style="width:14px;height:14px;opacity:.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <span>${escHtml(t)}</span></button>`).join("");
    sugBox.querySelectorAll(".sug-row").forEach(b=>{
      b.addEventListener("mousedown", ev => { ev.preventDefault(); go(list[+b.dataset.i]); });
    });
    el.appendChild(sugBox);
  }
  function closeSug(){ if (sugBox){ sugBox.remove(); sugBox=null; sugItems=[]; sugSel=-1; } }
  function moveSug(dir){
    if (!sugBox) return;
    sugSel = (sugSel + dir + sugItems.length) % sugItems.length;
    sugBox.querySelectorAll(".sug-row").forEach((b,i)=>b.classList.toggle("active", i===sugSel));
  }

  function onKey(ev, input, e, go){
    if (sugBox && (ev.key === "ArrowDown" || ev.key === "ArrowUp")){
      ev.preventDefault(); moveSug(ev.key === "ArrowDown" ? 1 : -1); return;
    }
    if (ev.key === "Enter"){
      if (sugBox && sugSel >= 0){ go(sugItems[sugSel]); }
      else go();
    }
    if (ev.key === "Escape"){ closeSug(); }
  }

  function searchPlaceholder(name){
    return I18N.lang === "ar" ? `ابحث في ${name}…` : `Search ${name}…`;
  }

  function doSearch(template, q){
    q = (q || "").trim();
    if (!q) return;
    let url;
    if (/^https?:\/\//i.test(q)) url = q;
    else if (template.includes("%s")) url = template.replace("%s", encodeURIComponent(q));
    else url = template + encodeURIComponent(q);
    window.open(url, "_self");
  }

  function reorder(from, to){
    if (!from || from === to) return;
    Store.update(s => {
      const arr = s.engines;
      const fi = arr.findIndex(x => x.id === from);
      const ti = arr.findIndex(x => x.id === to);
      const [moved] = arr.splice(fi, 1);
      arr.splice(ti, 0, moved);
    });
    render();
  }

  function openEngineModal(id){
    const s = Store.get();
    const e = id ? s.engines.find(x => x.id === id) : null;
    UI.modal(I18N.t(e ? "editEngine" : "newEngine"), `
      <label>${I18N.t("engineName")}</label>
      <input id="enName" value="${e ? esc(e.name) : ""}" placeholder="Brave, Wikipedia…" />
      <label>${I18N.t("engineUrl")}</label>
      <input id="enUrl" value="${e ? esc(e.url) : "https://example.com/search?q=%s"}" placeholder="https://…/?q=%s" />
      <label>${I18N.t("engineColor")}</label>
      <input id="enColor" type="color" value="${e ? e.color : "#7c9cff"}" style="height:46px;padding:4px" />
      <div class="modal-actions">
        ${e ? `<button class="btn btn-danger" id="enDel">${I18N.t("delete")}</button>` : ""}
        <button class="btn btn-soft" data-close>${I18N.t("cancel")}</button>
        <button class="btn btn-primary" id="enSave">${I18N.t("save")}</button>
      </div>`);
    document.getElementById("enSave").onclick = () => {
      const name = val("enName"), url = val("enUrl"), color = val("enColor");
      if (!name || !url) return;
      Store.update(st => {
        if (e){ Object.assign(e, { name, url, color }); }
        else { st.engines.push({ id: "e"+Date.now(), name, url, color, icon: name[0].toUpperCase() }); }
      });
      render(); UI.closeModal();
    };
    if (e) document.getElementById("enDel").onclick = () => {
      Store.update(st => { st.engines = st.engines.filter(x => x.id !== id); });
      render(); UI.closeModal();
    };
  }

  function focusFirst(){ const i = rail?.querySelector("input"); if (i){ i.focus(); } }
  function focusIndex(n){ const inputs = rail?.querySelectorAll("input"); if (inputs && inputs[n]) inputs[n].focus(); }

  function initHotkeys(){
    document.addEventListener("keydown", (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
      if (e.key === "/" && !typing){ e.preventDefault(); focusFirst(); }
      if (e.altKey && /^[1-9]$/.test(e.key)){ e.preventDefault(); focusIndex(+e.key - 1); }
      if (e.key === "Escape"){ closeSug(); UI.closeModal(); UI.closeDrawer(); document.activeElement?.blur(); }
    });
  }

  const esc = s => String(s).replace(/"/g,"&quot;");
  const escHtml = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const val = id => document.getElementById(id).value.trim();

  return { render, openEngineModal, initHotkeys, focusFirst };
})();
