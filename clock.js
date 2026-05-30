/* ============================================================
   clock.js — live time, Gregorian + Hijri (Umm Al-Qura), greeting
   ============================================================ */
const Clock = (() => {
  let timeEl, secEl, dayEl, gregEl, hijriEl, greetEl, raf, lastSec = -1;

  function arabicDigits(str){
    // keep Latin digits for clock for crisp monospace; Hijri shown per-locale
    return str;
  }

  function tick(){
    const now = new Date();
    const lang = I18N.lang;
    const locale = lang === "ar" ? "ar" : "en";

    // time (24h, locale-aware option could be added)
    const h = String(now.getHours()).padStart(2,"0");
    const m = String(now.getMinutes()).padStart(2,"0");
    const s = String(now.getSeconds()).padStart(2,"0");
    timeEl.textContent = `${h}:${m}`;
    if (s !== lastSec){ secEl.textContent = s; lastSec = s; }

    // greeting by hour
    const hr = now.getHours();
    let key = "night";
    if (hr >= 5 && hr < 12) key = "morning";
    else if (hr >= 12 && hr < 17) key = "afternoon";
    else if (hr >= 17 && hr < 21) key = "evening";
    greetEl.textContent = I18N.t(key);

    // day name (Arabic always for Arabic mode, localized otherwise)
    dayEl.textContent = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", { weekday:"long" }).format(now);

    // Gregorian date
    gregEl.textContent = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB",
      { day:"numeric", month:"long", year:"numeric" }).format(now);

    // Hijri — official Umm Al-Qura calendar
    try {
      hijriEl.textContent = new Intl.DateTimeFormat(
        (locale === "ar" ? "ar" : "en") + "-SA-u-ca-islamic-umalqura",
        { day:"numeric", month:"long", year:"numeric" }
      ).format(now);
    } catch {
      hijriEl.textContent = "—";
    }
  }

  function loop(){ tick(); raf = setTimeout(loop, 1000 - (Date.now() % 1000)); }

  function start(){
    timeEl  = document.getElementById("clockTime");
    secEl   = document.getElementById("clockSec");
    dayEl   = document.getElementById("dayName");
    gregEl  = document.getElementById("gregDate");
    hijriEl = document.getElementById("hijriDate");
    greetEl = document.getElementById("greeting");
    loop();
  }
  return { start, refresh: tick };
})();
