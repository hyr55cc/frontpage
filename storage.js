/* ============================================================
   storage.js — persistent state store (localStorage + pub/sub)
   ============================================================ */
const Store = (() => {
  const KEY = "lumen.v1";

  const DEFAULTS = {
    lang: "en",
    theme: "aurora",
    accent: "",                  // "" = theme default
    uiFont: "Manrope",
    glassBlur: 20,
    cardAlpha: 1,
    radiusScale: 1,
    bmView: "grid",
    background: { mode: "gradient", gradient: 0, image: "", blur: 0, bright: 1, daily: false },
    engines: [
      { id: "g",  name: "Google",   color: "#4f6bff", url: "https://www.google.com/search?q=%s",     icon: "G" },
      { id: "gpt",name: "ChatGPT",  color: "#10a37f", url: "https://chatgpt.com/?q=%s",               icon: "AI" },
      { id: "ds", name: "DeepSeek", color: "#4d6bfe", url: "https://chat.deepseek.com/?q=%s",         icon: "DS" }
    ],
    activeCat: 0,
    categories: [
      { name: "Essentials", items: [
        { title: "YouTube",  url: "https://youtube.com",  pinned: true },
        { title: "GitHub",   url: "https://github.com",   pinned: false },
        { title: "Gmail",    url: "https://mail.google.com", pinned: true },
        { title: "Maps",     url: "https://maps.google.com", pinned: false },
        { title: "X",        url: "https://x.com",        pinned: false },
        { title: "WhatsApp", url: "https://web.whatsapp.com", pinned: false }
      ]},
      { name: "Work", items: [
        { title: "Notion",   url: "https://notion.so",    pinned: false },
        { title: "Figma",    url: "https://figma.com",    pinned: false },
        { title: "Drive",    url: "https://drive.google.com", pinned: false }
      ]}
    ],
    todos: [],
    notes: "",
    widgets: {
      weather: true, prayer: true, todo: true, notes: true,
      pomodoro: true, calculator: false, worldclock: false,
      crypto: false, calendar: true
    },
    weatherCity: "Jeddah",
    worldClocks: ["Asia/Riyadh", "Europe/London", "America/New_York", "Asia/Tokyo"],
    cryptoCoins: ["bitcoin", "ethereum", "solana"]
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
    defaults: DEFAULTS
  };
  function emit(){ subs.forEach(fn => fn(state)); }
})();
