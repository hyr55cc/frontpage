/* ============================================================
   animations.css — keyframes, entrance reveals, micro-interactions
   ============================================================ */
@keyframes drift1{ 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(8vw,6vh) scale(1.15)} }
@keyframes drift2{ 0%{transform:translate(0,0) scale(1.1)} 100%{transform:translate(-7vw,-5vh) scale(1)} }
@keyframes drift3{ 0%{transform:translate(0,0)} 100%{transform:translate(-6vw,8vh)} }
@keyframes bounce{ 0%,100%{transform:translateY(0);opacity:.5} 50%{transform:translateY(-10px);opacity:1} }

@keyframes reveal-up{ from{opacity:0; transform:translateY(22px)} to{opacity:1; transform:translateY(0)} }
.reveal{ opacity:0; animation:reveal-up .8s var(--ease-out) forwards; animation-delay:var(--d,0s); }

@keyframes pop-in{ from{opacity:0; transform:scale(.9) translateY(10px)} to{opacity:1; transform:scale(1) translateY(0)} }
.bm-card,.widget{ animation:pop-in .5s var(--ease-out) backwards; }

@keyframes float-y{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
.brand-glyph{ animation:float-y 5s var(--ease) infinite; }

@keyframes shimmer{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }
.skeleton{ background:linear-gradient(90deg,color-mix(in srgb,var(--fg) 6%,transparent) 25%,color-mix(in srgb,var(--fg) 14%,transparent) 37%,color-mix(in srgb,var(--fg) 6%,transparent) 63%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:8px; color:transparent!important; }

@keyframes pulse-ring{ 0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 40%,transparent)} 100%{box-shadow:0 0 0 14px transparent} }
.pulse{ animation:pulse-ring 1.6s var(--ease) infinite; }

/* cyber glow flicker for the cyber theme clock */
[data-theme="cyber"] .clock{ animation:cyberglow 4s ease-in-out infinite; }
@keyframes cyberglow{ 0%,100%{filter:drop-shadow(0 0 10px color-mix(in srgb,var(--accent) 60%,transparent))} 50%{filter:drop-shadow(0 0 22px color-mix(in srgb,var(--accent-2) 70%,transparent))} }

/* glass reflection sweep on cards */
.bm-card::before,.widget::before{
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background:linear-gradient(120deg,transparent 30%,color-mix(in srgb,#fff 12%,transparent) 45%,transparent 60%);
  background-size:250% 100%; background-position:200% 0; opacity:0; transition:opacity .3s;
}
.widget{ position:relative; }
.bm-card:hover::before,.widget:hover::before{ opacity:1; animation:sweep 1s var(--ease) forwards; }
@keyframes sweep{ to{ background-position:-50% 0; } }
[data-theme="minimal"] .bm-card::before,[data-theme="minimal"] .widget::before{ display:none; }

/* ---------- animated background keyframes ---------- */
@keyframes auroraShift{
  0%{ background-position:0% 50%; }
  50%{ background-position:100% 50%; }
  100%{ background-position:0% 50%; }
}
@keyframes spaceDrift{
  0%{ background-position:0% 0%, 0 0; }
  50%{ background-position:100% 100%, 0 0; }
  100%{ background-position:0% 0%, 0 0; }
}
@media (prefers-reduced-motion: reduce){
  .bg-gradient[class*="anim-"]{ animation:none; }
  .bg-glow{ display:none; }
}
