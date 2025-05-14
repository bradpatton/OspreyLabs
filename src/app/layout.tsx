import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Osprey Labs | AI Automation & Custom Development',
  description: 'Transform your business with AI automation and custom software solutions. Osprey Labs specializes in AI-powered tools and custom app development to solve complex business problems.',
  viewport: 'width=device-width, initial-scale=1',
  keywords: ['AI Automation', 'Custom Software Development', 'Mobile Apps', 'Business AI Solutions', 'Osprey Labs'],
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