import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7C3AED' },
    { media: '(prefers-color-scheme: dark)', color: '#7C3AED' }
  ]
}

export const metadata: Metadata = {
  title: 'LearnFrame - Learn to Earn Platform',
  description: 'Complete blockchain quizzes and earn LEARN tokens on Base',
  keywords: ['blockchain', 'learning', 'crypto', 'base', 'quiz', 'earn', 'education', 'web3'],
  authors: [{ name: 'LearnFrame Team' }],
  creator: 'LearnFrame',
  publisher: 'LearnFrame',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://learnframe.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LearnFrame - Learn to Earn Platform', 
    description: 'Complete blockchain quizzes and earn LEARN tokens on Base',
    url: 'https://learnframe.vercel.app',
    siteName: 'LearnFrame',
    images: [
      {
        url: 'https://learnframe.vercel.app/api/preview',
        width: 1200,
        height: 630,
        alt: 'LearnFrame - Learn & Earn Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnFrame - Learn to Earn Platform',
    description: 'Complete blockchain quizzes and earn LEARN tokens on Base',
    images: ['https://learnframe.vercel.app/api/preview'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LearnFrame',
    startupImage: [
      '/splash.png',
    ],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://learnframe.vercel.app/api/preview',
    'fc:frame:button:1': 'Start Learning',
    'fc:frame:post_url': 'https://learnframe.vercel.app/api/frame',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#7C3AED',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} touch-manipulation no-tap-highlight mobile-scroll`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
