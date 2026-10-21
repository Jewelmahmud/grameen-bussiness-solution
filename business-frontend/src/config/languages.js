// config/languages.js

// Default languages that ship with the application
export const availableLanguages = [
  { code: 'bn', name: 'Bangla', nativeName: 'বাংলা', flag: 'bd' },
  { code: 'en', name: 'English', nativeName: 'English', flag: 'us' },
  { code: 'np', name: 'Nepali', nativeName: 'नेपाली', flag: 'np' },
  { code: 'pk', name: 'Urdu', nativeName: 'اُردُو‎', flag: 'pk' },
  { code: 'sl', name: 'Sinhala', nativeName: 'සිංහල', flag: 'sl' },
  { code: 'bt', name: 'Dzongkha', nativeName: 'རྫོང་ཁ', flag: 'bt' },
  { code: 'af', name: 'Afghan', nativeName: 'پښتو/دری', flag: 'af' },
  { code: 'cn', name: 'Chinese', nativeName: '中文', flag: 'cn' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'de' },
  
];

export const defaultLanguage = 'bn';

export const getLanguageByCode = (code) => {
  return availableLanguages.find(lang => lang.code === code) || availableLanguages[0];
};