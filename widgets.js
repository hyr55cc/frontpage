/* ============================================================
   widgets.js — weather, prayer, todo, notes, pomodoro,
   calculator, world clock, crypto, calendar
   ============================================================ */
const Widgets = (() => {
  let host;
  const timers = {};

  function clearTimers(){ Object.values(timers).forEach(t => clearInterval(t)); }

  function render(){
    host = document.getElementById("widgets");
    clearTimers();
    host.innerHTML = "";
    const s = Store.get();
    const w = s.widgets;
    // use saved order, append any new widgets not yet in it
    const all = ["weather","prayer","todo","notes","calendar","pomodoro","worldclock","crypto","stocks","calculator"];
    let order = (s.widgetOrder||[]).filter(k=>all.includes(k));
    all.forEach(k=>{ if(!order.includes(k)) order.push(k); });
    order.forEach((k, i) => {
      if (!w[k]) return;
      const node = builders[k]();
      if (!node) return;
      node.dataset.wkey = k;
      node.classList.add("size-" + (s.widgetSize[k] || "md"));
      node.style.animationDelay = (i*0.04)+"s";
      addWidgetControls(node, k);
      host.appendChild(node);
    });
    initWidgetDrag();
  }

  // size + drag handle injected into each widget head
  const SIZES = ["sm","md","lg"];
  function addWidgetControls(node, key){
    const head = node.querySelector(".widget-head");
    if (!head) return;
    const tools = document.createElement("div");
    tools.className = "w-tools";
    tools.innerHTML = `
      <button class="w-size" title="Resize"><svg viewBox="0 0 24 24" class="ic" style="width:15px;height:15px"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>
      <button class="w-drag" title="Move" aria-label="Move widget"><svg viewBox="0 0 24 24" class="ic" style="width:15px;height:15px"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg></button>`;
    head.appendChild(tools);
    tools.querySelector(".w-size").onclick = (e)=>{
      e.stopPropagation();
      Store.update(s=>{ const cur=s.widgetSize[key]||"md"; s.widgetSize[key]=SIZES[(SIZES.indexOf(cur)+1)%SIZES.length]; });
      render();
    };
    // drag handle activates dragging
    const handle = tools.querySelector(".w-drag");
    handle.addEventListener("pointerdown", ()=>{ node.setAttribute("draggable","true"); });
    node.addEventListener("dragend", ()=>node.removeAttribute("draggable"));
  }

  let dragKey=null;
  function initWidgetDrag(){
    host.querySelectorAll(".widget").forEach(node=>{
      node.addEventListener("dragstart", e=>{ dragKey=node.dataset.wkey; node.classList.add("w-dragging"); e.dataTransfer.effectAllowed="move"; });
      node.addEventListener("dragend",   ()=>{ dragKey=null; node.classList.remove("w-dragging"); host.querySelectorAll(".w-over").forEach(n=>n.classList.remove("w-over")); });
      node.addEventListener("dragover",  e=>{ e.preventDefault(); if(node.dataset.wkey!==dragKey) node.classList.add("w-over"); });
      node.addEventListener("dragleave", ()=>node.classList.remove("w-over"));
      node.addEventListener("drop", e=>{
        e.preventDefault();
        const target=node.dataset.wkey;
        if(!dragKey||dragKey===target) return;
        Store.update(s=>{
          const all=["weather","prayer","todo","notes","calendar","pomodoro","worldclock","crypto","stocks","calculator"];
          let order=(s.widgetOrder||[]).filter(k=>all.includes(k));
          all.forEach(k=>{ if(!order.includes(k)) order.push(k); });
          const from=order.indexOf(dragKey), to=order.indexOf(target);
          order.splice(from,1); order.splice(to,0,dragKey);
          s.widgetOrder=order;
        });
        render();
      });
    });
  }

  function card(titleKey, icon, bodyHtml, actionHtml=""){
    const el = document.createElement("section");
    el.className = "widget";
    el.innerHTML = `<div class="widget-head"><h3><svg viewBox="0 0 24 24" class="ic">${icon}</svg>${I18N.t(titleKey)}</h3>${actionHtml}</div><div class="w-body">${bodyHtml}</div>`;
    return el;
  }

  /* ---------------- WEATHER (Open-Meteo, no key) ---------------- */
  const WX = { 0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",71:"🌨️",73:"🌨️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️",96:"⛈️",99:"⛈️" };
  function buildWeather(){
    const el = card("weather", '<path d="M16 13a4 4 0 1 0-4-4M4 17h13a3 3 0 0 0 0-6"/>',
      `<div class="wx-now"><div class="wx-temp skeleton">22°</div></div>`,
      `<button class="w-act" data-city>${esc(Store.get().weatherCity)}</button>`);
    el.querySelector("[data-city]").onclick = () => {
      const c = prompt(I18N.t("cityPrompt"), Store.get().weatherCity);
      if (c){ Store.set({ weatherCity:c.trim() }); render(); }
    };
    loadWeather(el);
    return el;
  }
  async function loadWeather(el){
    const body = el.querySelector(".w-body");
    const city = Store.get().weatherCity;
    const lang = I18N.lang;
    const paint = (geo, fc, name) => {
      const c = fc.current, dy = fc.daily;
      const days = dy.time.slice(1,4).map((t,i)=>{
        const dn = new Intl.DateTimeFormat(lang==="ar"?"ar":"en",{weekday:"short"}).format(new Date(t));
        return `<div class="wx-day">${dn}<b>${WX[dy.weather_code[i+1]]||"·"}</b>${Math.round(dy.temperature_2m_max[i+1])}°</div>`;
      }).join("");
      body.innerHTML = `
        <div class="wx-now">
          <div class="wx-ico">${WX[c.weather_code]||"🌡️"}</div>
          <div><div class="wx-temp">${Math.round(c.temperature_2m)}°</div>
          <div class="wx-meta">${esc(name)} · 💨 ${Math.round(c.wind_speed_10m)} km/h</div></div>
        </div><div class="wx-row">${days}</div>`;
    };
    try {
      const geo = await Store.cachedFetch("geo_"+city+"_"+lang,
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=${lang}`,
        7*24*3600*1000);
      if (!geo.results?.length) throw 0;
      const { latitude, longitude, name } = geo.results[0];
      await Store.cachedFetch("wx_"+city,
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=4`,
        15*60*1000,
        (fc)=>paint(geo, fc, name));
    } catch { if(!body.querySelector(".wx-now")) body.innerHTML = `<div class="wx-meta">${I18N.t("noData")}</div>`; }
  }

  /* ---------------- PRAYER TIMES (Aladhan, Umm Al-Qura) ---------------- */
  function buildPrayer(){
    const el = card("prayer", '<path d="M12 3v2M5 21h14M7 21V10l5-5 5 5v11M10 21v-4h4v4"/>',
      `<div class="pray-list"><div class="pray-row skeleton">—</div></div>`);
    loadPrayer(el);
    return el;
  }
  async function loadPrayer(el){
    const body = el.querySelector(".w-body");
    const city = Store.get().weatherCity;
    const paint = (d) => {
      const t = d.data.timings;
      const names = { Fajr:["Fajr","الفجر"], Dhuhr:["Dhuhr","الظهر"], Asr:["Asr","العصر"], Maghrib:["Maghrib","المغرب"], Isha:["Isha","العشاء"] };
      const now = new Date(); const nowMin = now.getHours()*60+now.getMinutes();
      const order = ["Fajr","Dhuhr","Asr","Maghrib","Isha"];
      let nextKey = order.find(k => toMin(t[k]) > nowMin) || order[0];
      body.innerHTML = `<div class="pray-list">${order.map(k=>{
        const lbl = I18N.lang==="ar"?names[k][1]:names[k][0];
        return `<div class="pray-row ${k===nextKey?'next':''}"><span>${lbl}${k===nextKey?` · ${I18N.t("nextPrayer")}`:''}</span><b>${fmt12(t[k])}</b></div>`;
      }).join("")}</div>`;
    };
    try {
      await Store.cachedFetch("pray_"+city,
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=&method=4`,
        3*3600*1000, paint);
    } catch { if(!body.querySelector(".pray-list")) body.innerHTML = `<div class="pray-row">${I18N.t("noData")}</div>`; }
  }
  const toMin = s => { const [h,m]=s.split(":").map(Number); return h*60+m; };
  const fmt12 = s => { let [h,m]=s.split(":").map(Number); const ap=h>=12?"PM":"AM"; h=h%12||12; return `${h}:${String(m).padStart(2,"0")} ${ap}`; };

  /* ---------------- TODO (with reminders) ---------------- */
  const REMIND_OPTS = [
    {v:0,   en:"No reminder", ar:"بدون"},
    {v:5,   en:"5 min",       ar:"٥ دقائق"},
    {v:15,  en:"15 min",      ar:"١٥ دقيقة"},
    {v:30,  en:"30 min",      ar:"٣٠ دقيقة"},
    {v:60,  en:"1 hour",      ar:"ساعة"},
    {v:180, en:"3 hours",     ar:"٣ ساعات"}
  ];
  function buildTodo(){
    const el = card("todo", '<path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
      `<div class="todo-input">
         <input id="todoIn" placeholder="${I18N.t("addTask")}">
         <select id="todoRemind" class="todo-remind" title="${I18N.lang==='ar'?'تذكير':'Reminder'}">
           ${REMIND_OPTS.map(o=>`<option value="${o.v}">${I18N.lang==='ar'?o.ar:o.en}</option>`).join("")}
         </select>
         <button class="btn btn-primary" id="todoAdd" style="padding:10px 14px">+</button>
       </div>
       <div class="todo-list" id="todoList"></div>`);
    setTimeout(()=>{
      const list = el.querySelector("#todoList"), input = el.querySelector("#todoIn"), remind = el.querySelector("#todoRemind");
      const remLabel = (m)=>{ const o=REMIND_OPTS.find(x=>x.v===m); return o?(I18N.lang==="ar"?o.ar:o.en):m+"m"; };
      const draw = () => {
        const todos = Store.get().todos;
        list.innerHTML = todos.map((td,i)=>`
          <div class="todo-item ${td.done?'done':''}">
            <button class="todo-check ${td.done?'done':''}" data-i="${i}"><svg viewBox="0 0 24 24" class="ic"><path d="M5 12l5 5L20 7"/></svg></button>
            <span>${esc(td.text)}${td.remindEvery?` <em class="todo-bell">🔔 ${remLabel(td.remindEvery)}</em>`:''}</span>
            <button class="todo-del" data-del="${i}"><svg viewBox="0 0 24 24" class="ic" style="width:15px;height:15px"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          </div>`).join("") || `<div class="wx-meta" style="text-align:center;padding:14px">${I18N.lang==="ar"?"لا مهام":"All clear ✨"}</div>`;
        list.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{Store.update(s=>{const td=s.todos[+b.dataset.i]; td.done=!td.done; if(td.done) td.nextAt=null;});draw();});
        list.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{Store.update(s=>s.todos.splice(+b.dataset.del,1));draw();});
      };
      const add = async () => {
        const t=input.value.trim(); if(!t)return;
        const every=+remind.value||0;
        if(every>0){ await Notify.ensurePermission(); }
        Store.update(s=>s.todos.unshift({text:t,done:false,remindEvery:every,nextAt:every?Date.now()+every*60000:null}));
        input.value=""; draw();
        if(every>0) UI.toast(I18N.lang==="ar"?`سيُذكّرك كل ${remLabel(every)}`:`Reminder set · every ${remLabel(every)}`);
      };
      el.querySelector("#todoAdd").onclick = add;
      input.addEventListener("keydown",e=>{if(e.key==="Enter")add();});
      draw();
    });
    return el;
  }

  /* ---------------- NOTES ---------------- */
  function buildNotes(){
    const el = card("notes", '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
      `<textarea class="notes-area" id="notesArea" placeholder="${I18N.lang==="ar"?"اكتب أفكارك…":"Jot something down…"}">${esc(Store.get().notes)}</textarea>`);
    setTimeout(()=>{
      const ta = el.querySelector("#notesArea"); let to;
      ta.addEventListener("input",()=>{ clearTimeout(to); to=setTimeout(()=>Store.update(s=>s.notes=ta.value),400); });
    });
    return el;
  }

  /* ---------------- POMODORO ---------------- */
  function buildPomodoro(){
    const modes = { focus:25, shortBreak:5, longBreak:15 };
    let mode="focus", left=modes.focus*60, running=false;
    const el = card("pomodoro", '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
      `<div class="pomo">
        <div class="pomo-modes">${Object.keys(modes).map(m=>`<button class="pomo-mode ${m==="focus"?"active":""}" data-m="${m}">${I18N.t(m)}</button>`).join("")}</div>
        <div class="pomo-time" id="pomoTime">25:00</div>
        <div class="pomo-ctrl"><button class="btn btn-primary" id="pomoToggle">${I18N.t("start")}</button><button class="btn btn-soft" id="pomoReset">${I18N.t("reset2")}</button></div>
      </div>`);
    setTimeout(()=>{
      const timeEl=el.querySelector("#pomoTime"), toggle=el.querySelector("#pomoToggle");
      const draw=()=>{timeEl.textContent=`${String(Math.floor(left/60)).padStart(2,"0")}:${String(left%60).padStart(2,"0")}`;};
      const setMode=(m)=>{mode=m;left=modes[m]*60;running=false;toggle.textContent=I18N.t("start");el.querySelectorAll(".pomo-mode").forEach(b=>b.classList.toggle("active",b.dataset.m===m));draw();};
      el.querySelectorAll(".pomo-mode").forEach(b=>b.onclick=()=>setMode(b.dataset.m));
      toggle.onclick=()=>{running=!running;toggle.textContent=I18N.t(running?"pause":"start");timeEl.classList.toggle("pulse",running);};
      el.querySelector("#pomoReset").onclick=()=>setMode(mode);
      timers.pomo=setInterval(()=>{ if(running&&left>0){left--;draw();} else if(running&&left===0){running=false;toggle.textContent=I18N.t("start");timeEl.classList.remove("pulse");UI.toast("⏰ "+I18N.t(mode));} },1000);
      draw();
    });
    return el;
  }

  /* ---------------- CALCULATOR ---------------- */
  function buildCalc(){
    let expr="";
    const keys=["C","(",")","/","7","8","9","*","4","5","6","-","1","2","3","+","0",".","%","="];
    const el = card("calculator", '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2"/>',
      `<div class="calc-screen" id="calcScr">0</div><div class="calc-grid">${keys.map(k=>`<button class="calc-key ${"+-*/%".includes(k)?"op":""} ${k==="="?"eq":""}" data-k="${k}">${k}</button>`).join("")}</div>`);
    setTimeout(()=>{
      const scr=el.querySelector("#calcScr");
      const safe=s=>/^[0-9+\-*/().%\s]+$/.test(s);
      el.querySelectorAll(".calc-key").forEach(b=>b.onclick=()=>{
        const k=b.dataset.k;
        if(k==="C"){expr="";}
        else if(k==="="){ try{ if(safe(expr)){ expr=String(Function('"use strict";return ('+expr.replace(/%/g,"/100")+')')()); } }catch{expr="Error";} }
        else expr+=k;
        scr.textContent=expr||"0";
      });
    });
    return el;
  }

  /* ---------------- WORLD CLOCK ---------------- */
  function buildWorldClock(){
    const zones=Store.get().worldClocks;
    const el=card("worldclock", '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      `<div class="wclock-list">${zones.map(z=>`<div class="wclock-row" data-z="${z}"><div><div>${z.split("/").pop().replace(/_/g," ")}</div><div class="z">${z.split("/")[0]}</div></div><div class="t">--:--</div></div>`).join("")}</div>`);
    setTimeout(()=>{
      const upd=()=>el.querySelectorAll(".wclock-row").forEach(r=>{
        try{ r.querySelector(".t").textContent=new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:r.dataset.z}).format(new Date()); }catch{}
      });
      upd(); timers.wclock=setInterval(upd,1000);
    });
    return el;
  }

  /* ---------------- CRYPTO (CoinGecko) ---------------- */
  function buildCrypto(){
    const el=card("crypto", '<circle cx="12" cy="12" r="9"/><path d="M9 9h4a2 2 0 0 1 0 4H9zm0 4h4.5a2 2 0 0 1 0 4H9zM10 7v2M10 17v2M13 7v2M13 17v2"/>',
      `<div class="crypto-list"><div class="crypto-row skeleton">—</div></div>`);
    loadCrypto(el);
    return el;
  }
  async function loadCrypto(el){
    const body=el.querySelector(".w-body");
    const ids=Store.get().cryptoCoins.join(",");
    const paint = (d) => {
      const sym={bitcoin:"BTC",ethereum:"ETH",solana:"SOL",cardano:"ADA",ripple:"XRP",dogecoin:"DOGE",binancecoin:"BNB"};
      body.innerHTML=`<div class="crypto-list">${Store.get().cryptoCoins.map(c=>{
        const v=d[c]; if(!v) return "";
        const chg=v.usd_24h_change||0;
        return `<div class="crypto-row"><span class="sym">${sym[c]||c.toUpperCase()}</span><span class="chg ${chg>=0?'up':'down'}">${chg>=0?'▲':'▼'} ${Math.abs(chg).toFixed(1)}%</span><span class="px">$${v.usd.toLocaleString()}</span></div>`;
      }).join("")}</div>`;
    };
    try{
      await Store.cachedFetch("crypto_"+ids,
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        2*60*1000, paint);
    }catch{ if(!body.querySelector(".crypto-list")) body.innerHTML=`<div class="crypto-row">${I18N.t("noData")}</div>`; }
  }

  /* ---------------- STOCKS WATCHLIST (US live + Saudi links) ---------------- */
  const SAUDI_NAMES = { "2222":"أرامكو", "1120":"الراجحي", "7010":"STC", "2010":"سابك",
    "1010":"الرياض", "1180":"الأهلي", "2350":"كيان", "4002":"المواساة", "1211":"معادن", "4030":"البحري" };
  function buildStocks(){
    const el=card("stocks", '<path d="M3 17l6-6 4 4 8-8M21 7v5h-5"/>',
      `<div class="stk-group"><div class="stk-label">🇺🇸 ${I18N.lang==="ar"?"السوق الأمريكي":"US Market"}</div><div class="stk-boxes" id="stkUS"><div class="stk-box skeleton">—</div></div></div>
       <div class="stk-group"><div class="stk-label">🇸🇦 ${I18N.lang==="ar"?"السوق السعودي":"Saudi (Tadawul)"}</div><div class="stk-boxes" id="stkSA"></div></div>`,
      `<button class="w-act" data-edit>${I18N.lang==="ar"?"تعديل":"Edit"}</button>`);
    el.querySelector("[data-edit]").onclick=()=>Settings.open("widgets");
    loadStocksUS(el);
    renderSaudi(el);
    return el;
  }
  function renderSaudi(el){
    const box=el.querySelector("#stkSA");
    const syms=Store.get().saudiSymbols;
    if(!syms.length){ box.innerHTML=`<div class="stk-box muted">${I18N.lang==="ar"?"لا رموز":"None"}</div>`; return; }
    box.innerHTML=syms.map(code=>{
      const nm=SAUDI_NAMES[code]||code;
      return `<a class="stk-box link" href="https://www.tradingview.com/symbols/TADAWUL-${encodeURIComponent(code)}/" target="_blank" rel="noopener">
        <span class="stk-sym">${esc(nm)}</span><span class="stk-code">${esc(code)}</span><span class="stk-go">↗</span></a>`;
    }).join("");
  }
  async function loadStocksUS(el){
    const box=el.querySelector("#stkUS");
    const syms=Store.get().stockSymbols;
    const key=(Store.get().finnhubKey||"").trim();
    if(!syms.length){ box.innerHTML=`<div class="stk-box muted">${I18N.lang==="ar"?"لا رموز":"None"}</div>`; return; }

    const cell=(sym,px,chgPct)=>`<div class="stk-box"><span class="stk-sym">${esc(sym)}</span><span class="stk-px">${px.toLocaleString(undefined,{maximumFractionDigits:2})}</span><span class="stk-chg ${chgPct>=0?'up':'down'}">${chgPct>=0?'▲':'▼'}${Math.abs(chgPct).toFixed(2)}%</span></div>`;
    const linkCell=(sym)=>`<a class="stk-box link" href="https://finance.yahoo.com/quote/${encodeURIComponent(sym)}" target="_blank" rel="noopener"><span class="stk-sym">${esc(sym)}</span><span class="stk-go">${I18N.lang==="ar"?"عرض ↗":"view ↗"}</span></a>`;

    const rows=await Promise.all(syms.map(async sym=>{
      // 1) Finnhub if key provided (reliable, CORS-friendly)
      if(key){
        try{
          const d=await Store.cachedFetch("fh_"+sym, `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`, 60*1000);
          if(d && typeof d.c==="number" && d.c>0) return cell(sym, d.c, d.dp||0);
        }catch{}
      }
      // 2) Yahoo direct (works in some browsers)
      try{
        const j=await Store.cachedFetch("yh_"+sym, `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`, 60*1000);
        const m=j.chart.result[0].meta;
        const px=m.regularMarketPrice, prev=m.chartPreviousClose||m.previousClose||px;
        if(px) return cell(sym, px, prev?((px/prev-1)*100):0);
      }catch{}
      // 3) Free CORS proxy around Yahoo (no key needed)
      try{
        const target=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
        const j=await Store.cachedFetch("px_"+sym, `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`, 90*1000);
        const m=j.chart.result[0].meta;
        const px=m.regularMarketPrice, prev=m.chartPreviousClose||m.previousClose||px;
        if(px) return cell(sym, px, prev?((px/prev-1)*100):0);
      }catch{}
      // 4) last resort: link
      return linkCell(sym);
    }));
    box.innerHTML=rows.join("");
    if(!key && rows.some(r=>r.includes("stk-go"))){
      box.insertAdjacentHTML("beforeend",`<div class="stk-box muted" style="grid-column:1/-1;font-size:.72rem">${I18N.lang==="ar"?"للأسعار الفورية الدائمة أضف مفتاح Finnhub المجاني من الإعدادات":"For always-on live prices, add a free Finnhub key in Settings"}</div>`);
    }
  }

  /* ---------------- CALENDAR (Gregorian + Hijri month) ---------------- */
  function buildCalendar(){
    const now=new Date(), y=now.getFullYear(), mo=now.getMonth();
    const monthName=new Intl.DateTimeFormat(I18N.lang==="ar"?"ar":"en",{month:"long",year:"numeric"}).format(now);
    let hijri="";
    try{ hijri=new Intl.DateTimeFormat((I18N.lang==="ar"?"ar":"en")+"-SA-u-ca-islamic-umalqura",{month:"long",year:"numeric"}).format(now); }catch{}
    const first=new Date(y,mo,1).getDay(), days=new Date(y,mo+1,0).getDate();
    const dow=(I18N.lang==="ar"?["أحد","إثن","ثلا","أرب","خمي","جمع","سبت"]:["S","M","T","W","T","F","S"]);
    let cells=""; for(let i=0;i<first;i++) cells+=`<div class="cell muted"></div>`;
    for(let d=1;d<=days;d++) cells+=`<div class="cell ${d===now.getDate()?'today':''}">${d}</div>`;
    return card("calendar", '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
      `<div class="cal-head"><b>${monthName}</b><span class="z" style="color:var(--muted);font-size:.78rem">${hijri}</span></div>
       <div class="cal-grid">${dow.map(d=>`<div class="dow">${d}</div>`).join("")}${cells}</div>`);
  }

  const builders={ weather:buildWeather, prayer:buildPrayer, todo:buildTodo, notes:buildNotes,
    pomodoro:buildPomodoro, calculator:buildCalc, worldclock:buildWorldClock, crypto:buildCrypto, stocks:buildStocks, calendar:buildCalendar };

  const esc=s=>String(s||"").replace(/</g,"&lt;").replace(/"/g,"&quot;");
  return { render };
})();
