import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex items-center space-x-2">
      <select
        id="lang-select"
        className="border border-gray-300 rounded px-2 py-1 text-xs"
        value={i18n.language}
        onChange={e => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="ne">नेपाली</option>
      </select>
    </div>
  );
}
