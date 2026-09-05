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
    <html
      lang="pt-br"
      className={`${inter.variable} h-full antialiased bg-gray-900 text-white`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
