'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// Context definition
export const ThemeContext = createContext({ darkMode: true, setDarkMode: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setDarkMode(saved === 'dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <head>
        <title>ConvertFlow — Universal File Converter</title>
        <meta name="description" content="Convert files between any format instantly. PDF, DOCX, images, CSV, Excel and more — fast, secure, and free." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-50 transition-colors duration-300">
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
          {children}
        </ThemeContext.Provider>
        <Analytics />
      </body>
    </html>
  );
}
