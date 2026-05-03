import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iCool Gold Signals',
  description: 'Live XAUUSD scalping signal dashboard'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
