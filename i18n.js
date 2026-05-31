/* ============================================================
   i18n.js — English / Arabic strings + RTL handling
   ============================================================ */
const I18N = (() => {
  const dict = {
    en: {
      day:"Day", gregorian:"Gregorian", hijri:"Hijri",
      addEngine:"Add engine", searchHint:'Press <kbd>/</kbd> to focus · <kbd>Alt</kbd>+<kbd>1–9</kbd> to jump · <kbd>Enter</kbd> to search',
      bookmarks:"Bookmarks", category:"Category", settings:"Settings",
      appearance:"Appearance", background:"Background", widgetsTab:"Widgets", data:"Data",
      footHint:"Your data stays in this browser",
      morning:"Good morning", afternoon:"Good afternoon", evening:"Good evening", night:"Good night",
      theme:"Theme", accent:"Accent color", uiFont:"Interface font", glassBlur:"Glass blur",
      cardOpacity:"Card opacity", corners:"Corner roundness", bmViewLabel:"Bookmark layout",
      grid:"Grid", list:"List", bgMode:"Background style", gradient:"Gradient", solid:"Solid",
      image:"Image", uploadHint:"Click to upload a wallpaper (stored locally)",
      dailyRotate:"Daily rotating gradient", blur:"Background blur", brightness:"Brightness",
      reset:"Reset everything", exportData:"Export data", importData:"Import data",
      add:"Add", save:"Save", cancel:"Cancel", delete:"Delete",
      addBookmark:"Add bookmark", editBookmark:"Edit bookmark", title:"Title", url:"Address",
      newCategory:"New category", catName:"Category name", renameCat:"Rename category",
      engineName:"Engine name", engineUrl:"URL template (use %s for query)", engineColor:"Accent color",
      newEngine:"New search engine", editEngine:"Edit search engine",
      weather:"Weather", prayer:"Prayer times", todo:"To-do", notes:"Quick notes",
      pomodoro:"Pomodoro", calculator:"Calculator", worldclock:"World clock", crypto:"Crypto", stocks:"Stocks", calendar:"Calendar",
      addTask:"Add a task…", focus:"Focus", shortBreak:"Short break", longBreak:"Long break",
      start:"Start", pause:"Pause", reset2:"Reset", nextPrayer:"Next", saved:"Saved",
      enginesLabel:"Search engines", loading:"Loading…", noData:"Unavailable", today:"Today",
      cityPrompt:"Set weather city", deleteConfirm:"Delete this?", imported:"Imported", importFail:"Invalid file",
      folder:"Folders", suggestions:"Search suggestions", saturation:"Saturation", animated:"Animated",
      animAurora:"Aurora", animSpace:"Space", animCyber:"Cyber city", animNature:"Nature"
    },
    ar: {
      day:"اليوم", gregorian:"ميلادي", hijri:"هجري",
      addEngine:"إضافة محرك", searchHint:'اضغط <kbd>/</kbd> للتركيز · <kbd>Alt</kbd>+<kbd>1–9</kbd> للتنقل · <kbd>Enter</kbd> للبحث',
      bookmarks:"المفضلة", category:"فئة", settings:"الإعدادات",
      appearance:"المظهر", background:"الخلفية", widgetsTab:"الأدوات", data:"البيانات",
      footHint:"بياناتك محفوظة في هذا المتصفح فقط",
      morning:"صباح الخير", afternoon:"طاب يومك", evening:"مساء الخير", night:"طابت ليلتك",
      theme:"السمة", accent:"اللون المميز", uiFont:"خط الواجهة", glassBlur:"ضبابية الزجاج",
      cardOpacity:"شفافية البطاقات", corners:"استدارة الحواف", bmViewLabel:"تنسيق المفضلة",
      grid:"شبكة", list:"قائمة", bgMode:"نمط الخلفية", gradient:"تدرّج", solid:"لون",
      image:"صورة", uploadHint:"اضغط لرفع خلفية (تُحفظ محلياً)",
      dailyRotate:"تدرّج يومي متغيّر", blur:"ضبابية الخلفية", brightness:"السطوع",
      reset:"إعادة ضبط الكل", exportData:"تصدير البيانات", importData:"استيراد البيانات",
      add:"إضافة", save:"حفظ", cancel:"إلغاء", delete:"حذف",
      addBookmark:"إضافة موقع", editBookmark:"تعديل الموقع", title:"العنوان", url:"الرابط",
      newCategory:"فئة جديدة", catName:"اسم الفئة", renameCat:"إعادة تسمية الفئة",
      engineName:"اسم المحرك", engineUrl:"قالب الرابط (استخدم %s للبحث)", engineColor:"اللون",
      newEngine:"محرك بحث جديد", editEngine:"تعديل محرك البحث",
      weather:"الطقس", prayer:"مواقيت الصلاة", todo:"المهام", notes:"ملاحظات سريعة",
      pomodoro:"بومودورو", calculator:"الآلة الحاسبة", worldclock:"الساعة العالمية", crypto:"العملات الرقمية", stocks:"الأسهم", calendar:"التقويم",
      addTask:"أضف مهمة…", focus:"تركيز", shortBreak:"راحة قصيرة", longBreak:"راحة طويلة",
      start:"ابدأ", pause:"إيقاف", reset2:"تصفير", nextPrayer:"التالية", saved:"تم الحفظ",
      enginesLabel:"محركات البحث", loading:"جارٍ التحميل…", noData:"غير متاح", today:"اليوم",
      cityPrompt:"حدد مدينة الطقس", deleteConfirm:"حذف هذا العنصر؟", imported:"تم الاستيراد", importFail:"ملف غير صالح",
      folder:"مجلدات", suggestions:"اقتراحات البحث", saturation:"التشبّع", animated:"متحرّكة",
      animAurora:"شفق", animSpace:"فضاء", animCyber:"مدينة سايبر", animNature:"طبيعة"
    }
  };
  let lang = "en";
  const t = (k) => (dict[lang] && dict[lang][k]) || dict.en[k] || k;

  function apply(l){
    lang = (l === "ar") ? "ar" : "en";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      const v = t(k);
      if (/<kbd|<b|<i/.test(v)) el.innerHTML = v; else el.textContent = v;
    });
    const ll = document.getElementById("langLabel");
    if (ll) ll.textContent = lang === "ar" ? "EN" : "عربي";
  }
  return { t, apply, get lang(){ return lang; } };
})();
