import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LearnFrame - Learn to Earn Platform',
  description: 'Complete blockchain quizzes and earn LEARN tokens on Base',
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
      },
    ],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://learnframe.vercel.app/api/preview',
    'fc:frame:button:1': 'Start Learning',
    'fc:frame:post_url': 'https://learnframe.vercel.app/api/frame',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
