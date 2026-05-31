/* ============================================================
   themes.js — theme switching, accent, fonts, background system
   ============================================================ */
const Themes = (() => {
  const LIST  = ["aurora","light","dark","amoled","glass","cyber","midnight","vision","minimal","luxury"];
  const NAMES = { aurora:"Aurora", light:"Light", dark:"Dark", amoled:"AMOLED", glass:"Glass",
                  cyber:"Cyberpunk", midnight:"Midnight Blue", vision:"Vision Pro", minimal:"Minimal White", luxury:"Luxury Gold" };
  const ACCENTS = ["#7c9cff","#4f6bff","#00e0b8","#ff2ea6","#d4af5a","#ff7a45","#27d39a","#b06bff","#ff5fa8","#00f0ff"];
  const FONTS = { Manrope:"Manrope", Sora:"Sora", "IBM Plex Sans Arabic":"Plex Arabic", Bricolage:"Bricolage Grotesque" };
  const GRADIENTS = [
    "radial-gradient(120% 120% at 15% 0%,#1a1b3a,#0a0a18 42%,#05050d)",
    "linear-gradient(135deg,#3a2b6e,#26527e 45%,#2b8a9c)",
    "radial-gradient(120% 120% at 80% 0%,#2a0040,#10001f 50%,#06000c)",
    "linear-gradient(160deg,#241c0e,#120e07 55%,#0a0805)",
    "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    "linear-gradient(135deg,#42275a,#734b6d)",
    "radial-gradient(120% 120% at 50% 0%,#11998e,#063d3a)",
    "linear-gradient(135deg,#ff6a88,#ff99ac 50%,#fcb69f)"
  ];
  // animated background presets -> css class on #bgGradient
  const ANIM = ["aurora","space","cyber","nature"];

  function applyTheme(name){
    document.documentElement.setAttribute("data-theme", name);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(document.body).backgroundColor);
  }

  function applyVars(s){
    const root = document.documentElement.style;
    if (s.accent) { root.setProperty("--accent", s.accent); }
    else root.removeProperty("--accent");
    root.setProperty("--glass-blur", s.glassBlur + "px");
    root.setProperty("--card-alpha", s.cardAlpha);
    const fontMap = { Manrope:'"Manrope",system-ui,sans-serif', Sora:'"Sora",system-ui,sans-serif',
      "IBM Plex Sans Arabic":'"IBM Plex Sans Arabic",system-ui,sans-serif', Bricolage:'"Bricolage Grotesque",system-ui,sans-serif' };
    root.setProperty("--font-ui", fontMap[s.uiFont] || fontMap.Manrope);
    const rs = s.radiusScale || 1;
    root.setProperty("--r-md", (20*rs)+"px");
    root.setProperty("--r-lg", (28*rs)+"px");
    root.setProperty("--r-sm", (14*rs)+"px");
  }

  function applyBackground(s){
    const b = s.background;
    const grad = document.getElementById("bgGradient");
    const img = document.getElementById("bgImage");
    const root = document.documentElement.style;

    root.setProperty("--bg-blur", (b.blur||0) + "px");
    root.setProperty("--bg-bright", b.bright || 1);
    root.setProperty("--bg-sat", (b.sat==null?1:b.sat));

    grad.className = "bg-layer bg-gradient";  // reset animated classes

    if (b.mode === "image" && b.image){
      img.style.backgroundImage = `url("${b.image}")`;
      img.style.opacity = "1";
      grad.style.opacity = ".25";
      grad.style.background = "var(--grad)";
    } else {
      img.style.opacity = "0";
      grad.style.opacity = "1";
      if (b.mode === "animated"){
        const a = ANIM.includes(b.anim) ? b.anim : "aurora";
        grad.className = "bg-layer bg-gradient anim-" + a;
        grad.style.background = "";          // class drives it
      } else if (b.mode === "gradient"){
        let idx = b.gradient || 0;
        if (b.daily){ idx = dayIndex() % GRADIENTS.length; }
        grad.style.background = GRADIENTS[idx] || "var(--grad)";
      } else if (b.mode === "solid"){
        grad.style.background = getComputedStyle(document.body).getPropertyValue("--bg");
      }
    }
  }
  function dayIndex(){ const n=new Date(); return Math.floor((n - new Date(n.getFullYear(),0,0)) / 86400000); }

  function applyAll(s){ applyTheme(s.theme); applyVars(s); applyBackground(s); }

  function cycle(){
    const s = Store.get();
    const next = LIST[(LIST.indexOf(s.theme)+1) % LIST.length];
    Store.set({ theme: next });
    UI.toast(NAMES[next]);
  }

  return { LIST, NAMES, ACCENTS, FONTS, GRADIENTS, ANIM, applyAll, applyTheme, applyBackground, cycle };
})();
