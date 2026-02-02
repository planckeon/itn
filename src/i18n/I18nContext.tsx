import type React from "react";
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type Language, type Translations, getTranslation, languageNames } from "./translations";

interface I18nContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: Translations;
	languageNames: Record<Language, string>;
	availableLanguages: Language[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Detect browser language
function detectBrowserLanguage(): Language {
	const browserLang = navigator.language.split("-")[0];
	const supported: Language[] = ["en", "es", "fr", "de", "ja", "zh", "hi"];
	return supported.includes(browserLang as Language) ? (browserLang as Language) : "en";
}

// Load saved language preference
function loadSavedLanguage(): Language | null {
	try {
		const saved = localStorage.getItem("itn-language");
		if (saved && ["en", "es", "fr", "de", "ja", "zh", "hi"].includes(saved)) {
			return saved as Language;
		}
	} catch {
		// localStorage not available
	}
	return null;
}

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [language, setLanguageState] = useState<Language>(() => {
		return loadSavedLanguage() || detectBrowserLanguage();
	});

	const setLanguage = useCallback((lang: Language) => {
		setLanguageState(lang);
		try {
			localStorage.setItem("itn-language", lang);
		} catch {
			// localStorage not available
		}
	}, []);

	// Update document lang attribute
	useEffect(() => {
		document.documentElement.lang = language;
	}, [language]);

	const value: I18nContextType = {
		language,
		setLanguage,
		t: getTranslation(language),
		languageNames,
		availableLanguages: ["en", "es", "fr", "de", "ja", "zh", "hi"],
	};

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextType {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}

export default I18nContext;
