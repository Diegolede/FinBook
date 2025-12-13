/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslations, getDefaultLanguage, saveLanguage, Translations } from '../utils/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getDefaultLanguage());

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = getDefaultLanguage();
    setLanguageState(savedLanguage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

