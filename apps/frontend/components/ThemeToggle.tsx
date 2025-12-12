'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../app/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      <Sun className={`h-5 w-5 transition-all ${theme === 'light' ? 'opacity-100' : 'opacity-0 absolute'} ${theme === 'system' ? 'rotate-[-45deg] scale-75' : ''}`} />
      <Moon className={`h-5 w-5 transition-all ${theme === 'dark' ? 'opacity-100' : 'opacity-0 absolute'} ${theme === 'system' ? 'rotate-[-45deg] scale-75' : ''}`} />
      <Monitor className={`h-5 w-5 transition-all ${theme === 'system' ? 'opacity-100' : 'opacity-0 absolute'}`} />
    </button>
  );
}