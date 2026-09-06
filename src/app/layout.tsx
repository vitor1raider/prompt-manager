import { Sidebar } from '@/components/sidebar/sidebar';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Prompt Manager',
  description: 'Gerenciador de prompts',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-br">
      <body
        className={`${inter.variable} antialiased bg-gray-900 text-white flex h-screen`}
      >
        <Sidebar />
        <main className="relative flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 md:p-8 max-w-full md:max-w-3xl mx-auto h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
