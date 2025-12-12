import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from '../hooks/useAuth';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700', '900'] });

export const metadata: Metadata = {
 title: 'Creator Mind - The OS for Modern Creators',
  description: 'The Operating System for Modern Creators. Manage content, protect IP, and scale your audience with our AI-powered suite.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-display bg-[var(--background-theme)] text-[var(--text-theme)] transition-colors duration-200`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}