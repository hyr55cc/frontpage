/* ============================================================
   bookmarks.js — categories, CRUD, drag & drop, pin, grid/list
   ============================================================ */
const Bookmarks = (() => {
  let grid, tabs, dragIdx = null;

  function host(url){ try { return new URL(url).hostname.replace(/^www\./,""); } catch { return url; } }
  function favicon(url){ try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; } catch { return ""; } }
  const esc = s => String(s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;");

  function renderTabs(){
    tabs = document.getElementById("catTabs");
    const s = Store.get();
    tabs.innerHTML = "";
    s.categories.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "cat-tab" + (i === s.activeCat ? " active" : "");
      b.textContent = c.name;
      b.onclick = () => { Store.set({ activeCat: i }); renderTabs(); renderGrid(); };
      b.ondblclick = () => renameCategory(i);
      tabs.appendChild(b);
    });
  }

  function renderGrid(){
    grid = document.getElementById("bmGrid");
    const s = Store.get();
    const cat = s.categories[s.activeCat] || s.categories[0];
    grid.className = "bm-grid" + (s.bmView === "list" ? " list" : "");
    grid.innerHTML = "";

    // pinned first
    const items = [...(cat?.items || [])];
    const order = items.map((_, i) => i).sort((a,b) => (items[b].pinned?1:0) - (items[a].pinned?1:0));

    order.forEach((realIdx) => {
      const it = items[realIdx];
      const card = document.createElement("a");
      card.className = "bm-card";
      card.href = it.url; card.draggable = true; card.dataset.idx = realIdx;
      const fav = favicon(it.url);
      const letter = (it.title||"?")[0].toUpperCase();
      card.innerHTML = `
        <button class="bm-edit" title="Edit"><svg viewBox="0 0 24 24" class="ic"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
        <button class="bm-pin ${it.pinned?'on':''}" title="Pin"><svg viewBox="0 0 24 24" class="ic"><path d="M12 17v5M9 3h6l-1 7 3 3H7l3-3z"/></svg></button>
        <div class="bm-ico">${fav?`<img src="${fav}" alt="" onerror="this.replaceWith(document.createTextNode('${letter}'))">`:letter}</div>
        <div class="bm-meta"><div class="bm-title">${esc(it.title)}</div>${s.bmView==='list'?`<div class="bm-host">${esc(host(it.url))}</div>`:''}</div>`;

      card.querySelector(".bm-edit").addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); openModal(realIdx); });
      card.querySelector(".bm-pin").addEventListener("click", e => {
        e.preventDefault(); e.stopPropagation();
        Store.update(st => { st.categories[st.activeCat].items[realIdx].pinned = !it.pinned; });
        renderGrid();
      });
      // drag sort
      card.addEventListener("dragstart", () => { dragIdx = realIdx; card.classList.add("dragging"); });
      card.addEventListener("dragend",   () => { dragIdx = null; card.classList.remove("dragging"); document.querySelectorAll(".drag-over").forEach(x=>x.classList.remove("drag-over")); });
      card.addEventListener("dragover", e => { e.preventDefault(); card.classList.add("drag-over"); });
      card.addEventListener("dragleave",() => card.classList.remove("drag-over"));
      card.addEventListener("drop", e => { e.preventDefault(); move(dragIdx, realIdx); });
      grid.appendChild(card);
    });

    // add button
    const add = document.createElement("button");
    add.className = "bm-card bm-add";
    add.innerHTML = `<svg viewBox="0 0 24 24" class="ic"><path d="M12 5v14M5 12h14"/></svg>`;
    add.onclick = () => openModal(null);
    grid.appendChild(add);

    if ((cat?.items||[]).length === 0){
      const e = document.createElement("div"); e.className = "bm-empty";
      e.textContent = I18N.lang==="ar" ? "لا توجد مواقع بعد — أضف واحداً" : "No bookmarks yet — add one";
      grid.insertBefore(e, add);
    }
  }

  function move(from, to){
    if (from == null || from === to) return;
    Store.update(s => {
      const arr = s.categories[s.activeCat].items;
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
    });
    renderGrid();
  }

  function openModal(idx){
    const s = Store.get();
    const it = idx != null ? s.categories[s.activeCat].items[idx] : null;
    UI.modal(I18N.t(it ? "editBookmark" : "addBookmark"), `
      <label>${I18N.t("title")}</label>
      <input id="bmTitle" value="${it?esc(it.title):""}" placeholder="GitHub" />
      <label>${I18N.t("url")}</label>
      <input id="bmUrl" value="${it?esc(it.url):"https://"}" placeholder="https://github.com" />
      <div class="modal-actions">
        ${it?`<button class="btn btn-danger" id="bmDel">${I18N.t("delete")}</button>`:""}
        <button class="btn btn-soft" data-close>${I18N.t("cancel")}</button>
        <button class="btn btn-primary" id="bmSave">${I18N.t("save")}</button>
      </div>`);
    document.getElementById("bmSave").onclick = () => {
      let title = v("bmTitle"), url = v("bmUrl");
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      if (!title) title = host(url);
      Store.update(st => {
        const arr = st.categories[st.activeCat].items;
        if (it) Object.assign(it, { title, url });
        else arr.push({ title, url, pinned:false });
      });
      renderGrid(); UI.closeModal();
    };
    if (it) document.getElementById("bmDel").onclick = () => {
      Store.update(st => st.categories[st.activeCat].items.splice(idx,1));
      renderGrid(); UI.closeModal();
    };
  }

  function addCategory(){
    UI.modal(I18N.t("newCategory"), `
      <label>${I18N.t("catName")}</label>
      <input id="catName" placeholder="${I18N.lang==='ar'?'تسوّق، دراسة…':'Shopping, Study…'}" />
      <div class="modal-actions">
        <button class="btn btn-soft" data-close>${I18N.t("cancel")}</button>
        <button class="btn btn-primary" id="catSave">${I18N.t("add")}</button>
      </div>`);
    setTimeout(()=>document.getElementById("catName")?.focus(),50);
    document.getElementById("catSave").onclick = () => {
      const name = v("catName"); if (!name) return;
      Store.update(s => { s.categories.push({ name, items:[] }); s.activeCat = s.categories.length-1; });
      renderTabs(); renderGrid(); UI.closeModal();
    };
  }

  function renameCategory(i){
    const s = Store.get();
    UI.modal(I18N.t("renameCat"), `
      <label>${I18N.t("catName")}</label>
      <input id="catName" value="${esc(s.categories[i].name)}" />
      <div class="modal-actions">
        ${s.categories.length>1?`<button class="btn btn-danger" id="catDel">${I18N.t("delete")}</button>`:""}
        <button class="btn btn-soft" data-close>${I18N.t("cancel")}</button>
        <button class="btn btn-primary" id="catSave">${I18N.t("save")}</button>
      </div>`);
    document.getElementById("catSave").onclick = () => {
      const name = v("catName"); if (!name) return;
      Store.update(st => st.categories[i].name = name);
      renderTabs(); UI.closeModal();
    };
    if (s.categories.length>1) document.getElementById("catDel").onclick = () => {
      Store.update(st => { st.categories.splice(i,1); if (st.activeCat>=st.categories.length) st.activeCat=0; });
      renderTabs(); renderGrid(); UI.closeModal();
    };
  }

  function toggleView(){
    const s = Store.get();
    Store.set({ bmView: s.bmView === "grid" ? "list" : "grid" });
    renderGrid();
  }

  const v = id => document.getElementById(id).value.trim();
  function renderAll(){ renderTabs(); renderGrid(); }
  return { renderAll, renderTabs, renderGrid, addCategory, toggleView };
})();
