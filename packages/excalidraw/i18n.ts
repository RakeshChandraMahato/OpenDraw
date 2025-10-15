import { isDevEnv } from "@excalidraw/common";

import type { NestedKeyOf } from "@excalidraw/common/utility-types";

import { useAtomValue, editorJotaiStore, atom } from "./editor-jotai";
import fallbackLangData from "./locales/en.json";
import percentages from "./locales/percentages.json";

const COMPLETION_THRESHOLD = 75;

export interface Language {
  code: string;
  label: string;
  rtl?: boolean;
}

export type TranslationKeys = NestedKeyOf<typeof fallbackLangData>;

export const defaultLang = { code: "en", label: "English" };

export const languages: Language[] = [
  defaultLang,
  // Keep essential languages including all Indian languages
  ...[
    { code: "es-ES", label: "Español" },
    { code: "fr-FR", label: "Français" },
    { code: "de-DE", label: "Deutsch" },
    // Indian languages
    { code: "hi-IN", label: "हिन्दी" },
    { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
    { code: "mr-IN", label: "मराठी" },
    { code: "ta-IN", label: "தமிழ்" },
  ]
    .filter(
      (lang) =>
        (percentages as Record<string, number>)[lang.code] >=
        COMPLETION_THRESHOLD,
    )
    .sort((left, right) => (left.label > right.label ? 1 : -1)),
];

let currentLang: Language = defaultLang;
let currentLangData = {};

export const setLanguage = async (lang: Language) => {
  currentLang = lang;
  document.documentElement.dir = currentLang.rtl ? "rtl" : "ltr";
  document.documentElement.lang = currentLang.code;

  try {
    currentLangData = await import(`./locales/${currentLang.code}.json`);
  } catch (error: any) {
    console.error(`Failed to load language ${lang.code}:`, error.message);
    currentLangData = fallbackLangData;
  }

  editorJotaiStore.set(editorLangCodeAtom, lang.code);
};

export const getLanguage = () => currentLang;

const findPartsForData = (data: any, parts: string[]) => {
  for (let index = 0; index < parts.length; ++index) {
    const part = parts[index];
    if (data[part] === undefined) {
      return undefined;
    }
    data = data[part];
  }
  if (typeof data !== "string") {
    return undefined;
  }
  return data;
};

export const t = (
  path: NestedKeyOf<typeof fallbackLangData>,
  replacement?: { [key: string]: string | number } | null,
  fallback?: string,
) => {
  const parts = path.split(".");
  let translation =
    findPartsForData(currentLangData, parts) ||
    findPartsForData(fallbackLangData, parts) ||
    fallback;
  if (translation === undefined) {
    const errorMessage = `Can't find translation for ${path}`;
    // in production, don't blow up the app on a missing translation key
    if (import.meta.env.PROD) {
      console.warn(errorMessage);
      return "";
    }
    throw new Error(errorMessage);
  }

  if (replacement) {
    for (const key in replacement) {
      translation = translation.replace(`{{${key}}}`, String(replacement[key]));
    }
  }
  return translation;
};

/** @private atom used solely to rerender components using `useI18n` hook */
const editorLangCodeAtom = atom(defaultLang.code);

// Should be used in components that fall under these cases:
// - component is rendered as an <Excalidraw> child
// - component is rendered internally by <Excalidraw>, but the component
//   is memoized w/o being updated on `langCode`, `AppState`, or `UIAppState`
export const useI18n = () => {
  const langCode = useAtomValue(editorLangCodeAtom);
  return { t, langCode };
};
