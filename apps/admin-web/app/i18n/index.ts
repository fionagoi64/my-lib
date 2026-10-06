import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Hot-reload trigger for localization dictionary updates
import en from "./locales/en.json";
import zh from "./locales/zh.json";

const getInitialLanguage = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("language");
    if (saved) return saved;
    
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "zh" || browserLang === "en") {
      return browserLang;
    }
  }
  return "en";
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        zh: { translation: zh },
      },
      lng: getInitialLanguage(),
      fallbackLng: "en",
      interpolation: {
        escapeValue: false, // React already protects against XSS
      },
      react: {
        useSuspense: false, // Prevents loading issues with SSR
      }
    });
}

export default i18n;
export { getInitialLanguage };
