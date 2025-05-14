import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Osprey Labs | AI Automation & Custom Development',
  description: 'Transform your business with AI automation and custom software solutions. Osprey Labs specializes in AI-powered tools and custom app development to solve complex business problems.',
  keywords: ['AI Automation', 'Custom Software Development', 'Mobile Apps', 'Business AI Solutions', 'Osprey Labs'],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-50 text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
} 