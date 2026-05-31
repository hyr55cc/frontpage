/* ============================================================
   storage.js — persistent state store (localStorage + pub/sub)
   ============================================================ */
const Store = (() => {
  const KEY = "lumen.v4";

  const DEFAULTS = {
    lang: "en",
    theme: "aurora",
    accent: "",                  // "" = theme default
    uiFont: "Sora",
    glassBlur: 20,
    cardAlpha: 1,
    radiusScale: 1,
    bmView: "grid",              // grid | list | folder
    background: { mode: "gradient", gradient: 0, anim: "aurora", image: "", blur: 0, bright: 1, sat: 1, daily: false },
    engines: [
      { id: "g",   name: "Google",     color: "#4f6bff", url: "https://www.google.com/search?q=%s",        icon: "G" },
      { id: "gpt", name: "ChatGPT",    color: "#10a37f", url: "https://chatgpt.com/?q=%s",                  icon: "AI" },
      { id: "ds",  name: "DeepSeek",   color: "#4d6bfe", url: "https://chat.deepseek.com/?q=%s",            icon: "DS" },
      { id: "px",  name: "Perplexity", color: "#20b8cd", url: "https://www.perplexity.ai/search?q=%s",      icon: "PX" },
      { id: "yt",  name: "YouTube",    color: "#ff0033", url: "https://www.youtube.com/results?search_query=%s", icon: "YT" },
      { id: "x",   name: "X",          color: "#000000", url: "https://x.com/search?q=%s",                  icon: "X" },
      { id: "bing",name: "Bing",       color: "#0c8484", url: "https://www.bing.com/search?q=%s",           icon: "B" }
    ],
    suggest: true,
    activeCat: 0,
    categories: [
      { name: "AI", items: [
        { title: "ChatGPT",  url: "https://chatgpt.com",        pinned: true },
        { title: "DeepSeek", url: "https://chat.deepseek.com",  pinned: false },
        { title: "Claude",   url: "https://claude.ai",          pinned: true },
        { title: "Gemini",   url: "https://gemini.google.com",  pinned: false }
      ]},
      { name: "Work", items: [
        { title: "Gmail",  url: "https://mail.google.com",  pinned: true },
        { title: "Notion", url: "https://notion.so",        pinned: false },
        { title: "Drive",  url: "https://drive.google.com", pinned: false }
      ]},
      { name: "Media", items: [
        { title: "YouTube", url: "https://youtube.com",  pinned: true },
        { title: "Netflix", url: "https://netflix.com",  pinned: false },
        { title: "Spotify", url: "https://open.spotify.com", pinned: false }
      ]},
      { name: "Finance", items: [
        { title: "TradingView", url: "https://tradingview.com", pinned: false },
        { title: "TASI",        url: "https://www.saudiexchange.sa", pinned: false },
        { title: "Investing",   url: "https://investing.com",   pinned: false }
      ]}
    ],
    todos: [],
    notes: "",
    finnhubKey: "",
    alertSound: "chime",
    widgetOrder: ["weather","prayer","todo","notes","calendar","pomodoro","worldclock","crypto","stocks","calculator"],
    widgetSize: {},
    widgets: {
      weather: true, prayer: true, todo: true, notes: true,
      pomodoro: true, calculator: false, worldclock: false,
      crypto: false, stocks: false, calendar: true
    },
    weatherCity: "Jeddah",
    worldClocks: ["Asia/Riyadh", "Europe/London", "America/New_York", "Asia/Tokyo"],
    cryptoCoins: ["bitcoin", "ethereum", "solana"],
    stockSymbols: ["AAPL", "MSFT", "NVDA", "TSLA"],
    saudiSymbols: ["2222", "1120", "7010", "2010"]
  };

  let state = load();
  const subs = new Set();

  function load(){
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      return deepMerge(structuredClone(DEFAULTS), raw || {});
    } catch { return structuredClone(DEFAULTS); }
  }
  function deepMerge(base, over){
    for (const k in over){
      if (over[k] && typeof over[k] === "object" && !Array.isArray(over[k]) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])){
        deepMerge(base[k], over[k]);
      } else { base[k] = over[k]; }
    }
    return base;
  }
  function persist(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){ console.warn("Storage full", e); }
  }

  return {
    get: () => state,
    set(patch){ Object.assign(state, patch); persist(); emit(); },
    update(fn){ fn(state); persist(); emit(); },
    subscribe(fn){ subs.add(fn); return () => subs.delete(fn); },
    reset(){ state = structuredClone(DEFAULTS); persist(); emit(); },
    export(){ return JSON.stringify(state, null, 2); },
    import(json){
      try { state = deepMerge(structuredClone(DEFAULTS), JSON.parse(json)); persist(); emit(); return true; }
      catch { return false; }
    },
    defaults: DEFAULTS,
    /* cachedFetch: returns cached value instantly via onCache, then refreshes.
       Cache stored in its own localStorage key, TTL in ms. */
    async cachedFetch(key, url, ttl, onCache){
      const ck = "lumen.cache." + key;
      let cached = null;
      try { cached = JSON.parse(localStorage.getItem(ck)); } catch {}
      if (cached && onCache) { try { onCache(cached.data, true); } catch {} }
      const fresh = cached && (Date.now() - cached.t < ttl);
      if (fresh) return cached.data;
      try {
        const data = await fetch(url).then(r => { if(!r.ok) throw 0; return r.json(); });
        try { localStorage.setItem(ck, JSON.stringify({ t: Date.now(), data })); } catch {}
        return data;
      } catch (e) {
        if (cached) return cached.data;   // fall back to stale cache
        throw e;
      }
    }
  };
  function emit(){ subs.forEach(fn => fn(state)); }
})();
