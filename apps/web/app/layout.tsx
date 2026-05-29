import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/shared/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
});

export const viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'DevNexus — AI Developer Command Center',
  description:
    'Your intelligent developer command center. Real-time GitHub stats, AI progress narratives, smart TODOs, hackathon mission control, and more.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.png', apple: '/apple-icon.png' },
  openGraph: {
    title: 'DevNexus — AI Developer Command Center',
    description:
      'The AI-powered creator command center for indie developers and student hackers.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="midnight" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
