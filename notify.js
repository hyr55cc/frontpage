/* ============================================================
   notify.js — sounds (WebAudio), browser notifications,
               and todo reminder scheduling
   ============================================================ */
const Notify = (() => {
  let ctx;
  const SOUNDS = ["chime", "bell", "ping", "marimba"];

  function ac(){ if(!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; }

  // simple synthesized tones so no audio files are needed (works offline)
  function play(name){
    try{
      const a = ac();
      if (a.state === "suspended") a.resume();
      const seqs = {
        chime:   [[880,0],[1320,.12],[1760,.24]],
        bell:    [[1568,0],[1568,.18]],
        ping:    [[1200,0]],
        marimba: [[523,0],[659,.1],[784,.2],[1047,.3]]
      };
      const seq = seqs[name] || seqs.chime;
      seq.forEach(([f,t])=>{
        const o = a.createOscillator(), g = a.createGain();
        o.type = name==="marimba" ? "triangle" : "sine";
        o.frequency.value = f;
        o.connect(g); g.connect(a.destination);
        const start = a.currentTime + t;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
        o.start(start); o.stop(start + 0.55);
      });
    }catch(e){}
  }

  async function ensurePermission(){
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const p = await Notification.requestPermission();
    return p === "granted";
  }

  function fire(title, body){
    const sound = Store.get().alertSound || "chime";
    play(sound);
    if ("Notification" in window && Notification.permission === "granted"){
      try {
        const n = new Notification(title, { body, icon: "icons/icon-192.png", tag: "frontpage-task" });
        setTimeout(()=>n.close(), 12000);
      } catch {
        UI.toast("⏰ " + body);
      }
    } else {
      UI.toast("⏰ " + body);
    }
  }

  /* ---- reminder scheduler: checks todos every 20s ---- */
  let timer;
  function start(){
    clearInterval(timer);
    timer = setInterval(check, 20000);
    check();
  }
  function check(){
    const now = Date.now();
    let changed = false;
    const todos = Store.get().todos;
    todos.forEach(td => {
      if (td.done || !td.remindEvery) return;
      if (!td.nextAt) { td.nextAt = now + td.remindEvery*60000; changed = true; return; }
      if (now >= td.nextAt){
        fire(I18N.lang==="ar" ? "تذكير بمهمة" : "Task reminder", td.text);
        td.nextAt = now + td.remindEvery*60000;  // reschedule
        changed = true;
      }
    });
    if (changed) Store.update(()=>{});  // persist nextAt
  }

  return { SOUNDS, play, fire, ensurePermission, start, check };
})();
