import type { Metadata } from 'next';
import './globals.css';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';

export const metadata: Metadata = {
  title: 'Divisha Electronics — Executive Operations Portal',
  description: 'Enterprise 42-section e-commerce control suite for Divisha Electronics & Bespoke Living.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#faf9f6] text-slate-900 flex font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader />
          <main className="p-8 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
