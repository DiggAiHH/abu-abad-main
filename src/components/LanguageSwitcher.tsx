import React from 'react';

interface LanguageSwitcherProps {
  languages: Array<string>;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ languages, currentLanguage, onLanguageChange }) => {
  return (
    <div>
      {languages.map((language) => (
        <button
          key={language}
          onClick={() => onLanguageChange(language)}
          disabled={language === currentLanguage}
        >
          {language}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;