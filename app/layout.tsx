import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterServiceWorker } from '../components/pwa/RegisterServiceWorker';

export const metadata: Metadata = {
  title: 'きろくま',
  description: '体重・食事・筋トレを記録するアプリ',
  applicationName: 'きろくま',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'きろくま',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/maskable-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#f97316',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
