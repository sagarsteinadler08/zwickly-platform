import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all hover:shadow-md hover:shadow-purple-500/10 dark:hover:shadow-lg dark:hover:shadow-purple-500/20 relative group"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 group-hover:text-purple-600 transition-colors" />
      )}
      
      {/* Tooltip */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;

