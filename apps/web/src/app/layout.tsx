import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppConcierge } from '@/components/WhatsAppConcierge';

export const metadata: Metadata = {
  title: 'Divisha Electronics — Ultra-Premium Electronics & Handcrafted Teak Furniture',
  description:
    'Experience the harmony of 4K OLED visual technology, Dolby Atmos acoustic engineering, and bespoke solid teak timber joinery with white-glove installation.',
  keywords: [
    'Divisha Electronics',
    'Sony OLED TV',
    'Bespoke Teak Furniture',
    'Italian Leather Sofa',
    'Samsung Refrigerator',
    'Luxury Living India'
  ],
  authors: [{ name: 'Divisha Electronics' }],
  openGraph: {
    title: 'Divisha Electronics & Bespoke Living',
    description: 'Ultra-Premium Electronics Meets Handcrafted Solid Teak Furniture.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Divisha Electronics'
  }
};

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

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
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#faf9f6] text-slate-900 flex flex-col font-sans">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <WhatsAppConcierge />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
