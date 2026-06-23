import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'きろくま',
  description: '体重・食事・筋トレを記録するアプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
