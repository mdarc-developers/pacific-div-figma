import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: string | null;
  resolvedTheme: string | null;
  setTheme: (nextTheme: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const resolvedTheme = () => {
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<string | null>(null);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

