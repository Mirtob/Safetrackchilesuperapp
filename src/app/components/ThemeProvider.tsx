import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('safetrack-theme');
    if (stored === 'dark' || stored === 'light') {
      return stored as Theme;
    }
    // Default to light for reducing eye strain in field work
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme
    root.classList.add(theme);
    
    // Update background color immediately for the html element
    if (theme === 'dark') {
      root.style.backgroundColor = '#18181b'; // zinc-900
      document.body.style.backgroundColor = '#18181b';
    } else {
      root.style.backgroundColor = '#f8fafc'; // slate-50
      document.body.style.backgroundColor = '#f8fafc';
    }
    
    // Save to localStorage
    localStorage.setItem('safetrack-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}