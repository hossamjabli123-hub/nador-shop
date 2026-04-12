import { useState, useCallback } from "react";

export type Language = "ar" | "en" | "fr";

const LANG_KEY = "shopnador_lang";

function getInitialLang(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ar" || saved === "en" || saved === "fr") return saved;
  } catch {}
  return "ar";
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(getInitialLang);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, []);

  return { language, setLanguage };
}
