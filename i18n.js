/* ============================================================
   base.css — reset, layout shell, background system
   ============================================================ */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{ -webkit-text-size-adjust:100%; scroll-behavior:smooth; }
body{
  font-family:var(--font-ui);
  color:var(--fg);
  background:var(--bg);
  min-height:100vh; min-height:100dvh;
  overflow-x:hidden;
  line-height:1.5;
  -webkit-font-smoothing:antialiased;
  transition:color .4s var(--ease), background .4s var(--ease);
}
html[dir="rtl"] body{ font-family:var(--font-ar); }
html[dir="rtl"] .clock,html[dir="rtl"] .greeting{ font-family:var(--font-display); }

button,input,textarea,select{ font:inherit; color:inherit; }
button{ cursor:pointer; background:none; border:none; }
a{ color:inherit; text-decoration:none; }
.ic{ width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round; }
kbd{
  font-family:var(--font-mono); font-size:.72em; padding:1px 6px; border-radius:6px;
  background:color-mix(in srgb,var(--fg) 10%,transparent); border:1px solid var(--card-brd);
}
::selection{ background:color-mix(in srgb,var(--accent) 40%,transparent); }

/* ---------- background stack ---------- */
.bg-stack{ position:fixed; inset:0; z-index:-1; overflow:hidden; }
.bg-layer{ position:absolute; inset:0; }
.bg-gradient{
  background:var(--grad);
  filter:blur(var(--bg-blur)) brightness(var(--bg-bright)) saturate(var(--bg-sat));
  transition:background .6s var(--ease), filter .4s var(--ease);
}
.bg-image{
  background-image:var(--bg-image); background-size:cover; background-position:center;
  filter:blur(var(--bg-blur)) brightness(var(--bg-bright)) saturate(var(--bg-sat));
  transform:scale(1.06);
  transition:filter .4s var(--ease), opacity .6s var(--ease);
}
/* ---------- animated backgrounds ---------- */
.bg-gradient.anim-aurora{
  background:linear-gradient(125deg,#0a0a1f,#1b2a6b,#0d6e7a,#5b2a8a,#0a0a1f);
  background-size:400% 400%; animation:auroraShift 26s ease infinite;
}
.bg-gradient.anim-space{
  background:radial-gradient(130% 130% at 50% 10%,#1a1140,#0a0a22 45%,#04040c),
             radial-gradient(60% 60% at 80% 20%,rgba(120,90,255,.25),transparent);
  background-size:160% 160%, 100% 100%; animation:spaceDrift 40s ease infinite;
}
.bg-gradient.anim-cyber{
  background:linear-gradient(125deg,#12002b,#ff2ea6,#00f0ff,#12002b);
  background-size:400% 400%; animation:auroraShift 18s linear infinite;
}
.bg-gradient.anim-nature{
  background:linear-gradient(125deg,#0b2515,#1f6f4a,#3fa66f,#0d3a22,#0b2515);
  background-size:400% 400%; animation:auroraShift 30s ease infinite;
}
/* ---------- mouse-follow glow ---------- */
.bg-glow{
  position:absolute; width:520px; height:520px; left:0; top:0; border-radius:50%;
  background:radial-gradient(circle, color-mix(in srgb, var(--accent) 40%, transparent), transparent 62%);
  filter:blur(40px); opacity:.0; pointer-events:none; transform:translate(-50%,-50%);
  transition:opacity .5s var(--ease); mix-blend-mode:screen; will-change:left,top;
}
.bg-particles{ width:100%;height:100%; opacity:.7; }
.bg-grain{
  position:absolute; inset:-50%; opacity:.05; pointer-events:none; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.bg-orb{
  position:absolute; width:46vmax; height:46vmax; border-radius:50%;
  filter:blur(80px); opacity:.5; pointer-events:none; will-change:transform;
}
.orb-1{ background:var(--orb-1); top:-18%; left:-10%; animation:drift1 26s var(--ease) infinite alternate; }
.orb-2{ background:var(--orb-2); bottom:-22%; right:-12%; animation:drift2 32s var(--ease) infinite alternate; }
.orb-3{ background:var(--orb-3); top:35%; right:25%; width:30vmax; height:30vmax; opacity:.32; animation:drift3 38s var(--ease) infinite alternate; }
[data-theme="minimal"] .bg-orb{ opacity:.25; filter:blur(110px); }
[data-theme="light"] .bg-orb{ opacity:.35; }

/* ---------- layout shell ---------- */
.topbar{
  position:static; z-index:60;
  display:flex; align-items:center; justify-content:space-between;
  padding:14px clamp(16px,4vw,40px);
  background:transparent;
  border-bottom:1px solid transparent;
}
.brand{ display:flex; align-items:center; gap:10px; font-weight:800; letter-spacing:-.02em; }
.brand-glyph{
  width:26px;height:26px;border-radius:9px;
  background:conic-gradient(from 180deg,var(--accent),var(--accent-2),var(--accent-3),var(--accent));
  box-shadow:0 0 22px -4px var(--accent);
}
.brand-name{ font-family:var(--font-display); font-size:1.15rem; }
.topbar-actions{ display:flex; gap:8px; align-items:center; }

.stage{
  max-width:var(--maxw); margin:0 auto;
  padding:clamp(20px,4vw,56px) clamp(16px,4vw,40px) 60px;
  display:flex; flex-direction:column; gap:clamp(28px,4vw,46px);
}

.foot{
  display:flex; gap:10px; align-items:center; justify-content:center;
  color:var(--muted); font-size:.8rem; padding-top:10px; opacity:.8;
}
.foot .dot{ opacity:.5; }

/* boot screen */
.boot{
  position:fixed; inset:0; z-index:200; display:grid; place-content:center; gap:18px;
  background:var(--bg); transition:opacity .5s var(--ease), visibility .5s;
}
.boot.gone{ opacity:0; visibility:hidden; }
.boot-mark{ display:flex; gap:8px; justify-self:center; }
.boot-mark span{ width:12px;height:12px;border-radius:50%; background:var(--accent); animation:bounce 1s var(--ease) infinite; }
.boot-mark span:nth-child(2){ background:var(--accent-2); animation-delay:.15s; }
.boot-mark span:nth-child(3){ background:var(--accent-3); animation-delay:.3s; }
.boot-text{ font-family:var(--font-display); letter-spacing:.3em; text-transform:uppercase; color:var(--muted); font-size:.8rem; text-align:center; }

@media (max-width:560px){
  .brand-name{ display:none; }
  .stage{ gap:26px; }
}
@media (prefers-reduced-motion:reduce){
  *{ animation-duration:.001ms!important; transition-duration:.06s!important; }
  .bg-orb{ animation:none; }
}
