import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navigation } from '@/components/nav/Navigation';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DreamWeaver',
  description: 'Your personal dream journal and analysis companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#1a1c2e]`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <div className="bg-[#1a1c2e] border-b border-purple-500/10">
              <Navigation />
            </div>
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
