import { createContext, useContext, useState, useEffect } from 'react';

// Import terjemahan
import id from '../locales/id.json';
import en from '../locales/en.json';

const translations = { id, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Ambil bahasa dari localStorage atau default 'id'
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved === 'en' ? 'en' : 'id';
  });

  const [t, setT] = useState(translations[language]);

  useEffect(() => {
    setT(translations[language]);
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id');
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}