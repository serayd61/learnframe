import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
// import { Analytics } from '@vercel/analytics/react';
// import { SpeedInsights } from '@vercel/speed-insights/next';
// import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7C3AED' },
    { media: '(prefers-color-scheme: dark)', color: '#7C3AED' }
  ],
  colorScheme: 'dark',
  minimumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'LearnFrame - Learn & Earn on Base',
    template: '%s | LearnFrame'
  },
  description: 'Master blockchain knowledge and earn LEARN tokens on Base. Interactive quizzes, real rewards, global leaderboards.',
  keywords: [
    'blockchain education',
    'learn to earn',
    'base blockchain', 
    'crypto quiz',
    'web3 learning',
    'blockchain quiz',
    'earn tokens',
    'defi education',
    'base mini app',
    'farcaster frame'
  ],
  authors: [
    { 
      name: 'LearnFrame Team',
      url: 'https://learnframe.vercel.app'
    }
  ],
  creator: 'LearnFrame Team',
  publisher: 'LearnFrame',
  applicationName: 'LearnFrame',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
    date: false,
    url: false
  },
  metadataBase: new URL('https://learnframe.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'en': '/'
    }
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': 'large',
      'max-image-preview': 'large',
      'max-snippet': 160,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://learnframe.vercel.app',
    siteName: 'LearnFrame',
    title: 'LearnFrame - Learn & Earn on Base',
    description: 'Master blockchain knowledge and earn LEARN tokens on Base. Interactive quizzes, real rewards, global leaderboards.',
    images: [
      {
        url: 'https://learnframe.vercel.app/api/preview',
        width: 1200,
        height: 630,
        alt: 'LearnFrame - Learn & Earn Platform on Base',
        type: 'image/png',
      },
      {
        url: 'https://learnframe.vercel.app/icon.png',
        width: 512,
        height: 512,
        alt: 'LearnFrame Logo',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@learnframe_app',
    creator: '@learnframe_app',
    title: 'LearnFrame - Learn & Earn on Base',
    description: 'Master blockchain knowledge and earn LEARN tokens on Base. Interactive quizzes, real rewards, global leaderboards.',
    images: {
      url: 'https://learnframe.vercel.app/api/preview',
      alt: 'LearnFrame - Learn & Earn Platform on Base',
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'education',
  classification: 'Education, Blockchain, DeFi',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/icon.svg',
        color: '#7C3AED',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LearnFrame',
    startupImage: [
      {
        url: '/splash.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash.png', 
        media: 'screen',
      }
    ],
  },
  other: {
    // Farcaster Frame Meta Tags
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://learnframe.vercel.app/api/preview',
    'fc:frame:button:1': 'Start Learning 🎓',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://learnframe.vercel.app/quiz',
    'fc:frame:post_url': 'https://learnframe.vercel.app/api/frame',
    'fc:frame:image:aspect_ratio': '1.91:1',
    
    // Base Mini-App Meta Tags
    'miniapp:name': 'LearnFrame',
    'miniapp:version': '1.2.0',
    'miniapp:description': 'Learn blockchain knowledge, earn LEARN tokens',
    'miniapp:icon': '/icon.png',
    'miniapp:category': 'education',
    'miniapp:chain': 'base',
    'miniapp:permissions': 'wallet.connect,user.profile,notifications.push',
    
    // Progressive Web App
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'LearnFrame',
    
    // Windows/IE
    'msapplication-TileColor': '#7C3AED',
    'msapplication-TileImage': '/icon.png',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-navbutton-color': '#7C3AED',
    
    // Theme and Design
    'theme-color': '#7C3AED',
    'color-scheme': 'dark light',
    
    // Performance Hints
    'dns-prefetch': 'true',
    'preconnect': 'https://fonts.googleapis.com',
    
    // Security
    'referrer': 'strict-origin-when-cross-origin',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className="scroll-smooth antialiased"
      suppressHydrationWarning
    >
      <head>
        {/* Preload Critical Resources */}
        <link 
          rel="preload" 
          href="/fonts/inter-var.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous"
        />
        <link 
          rel="preconnect" 
          href="https://mainnet.base.org" 
        />
        <link 
          rel="dns-prefetch" 
          href="https://basescan.org" 
        />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />

        {/* Mini-App Detection Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.isMiniApp = !!(
                window.webkit?.messageHandlers?.miniApp ||
                window.ReactNativeWebView ||
                window.FarcasterWebView ||
                navigator.userAgent.includes('Farcaster') ||
                navigator.userAgent.includes('Base')
              );
              
              if (window.isMiniApp) {
                document.documentElement.classList.add('mini-app-mode');
                console.log('🚀 Running in Mini-App mode');
              }
            `,
          }}
        />
      </head>
      
      <body 
        className={`
          ${inter.className} 
          ${inter.variable}
          touch-manipulation 
          no-tap-highlight 
          mobile-scroll 
          bg-black 
          text-white 
          antialiased 
          selection:bg-purple-500/30
        `}
        suppressHydrationWarning
      >
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white p-2 rounded-lg z-50"
        >
          Skip to main content
        </a>

        {/* Global Providers */}
        <Providers>
          {/* Main Content */}
          <main id="main-content" className="min-h-screen">
            {children}
          </main>

          {/* Global Toast Notifications */}
          {/* <Toaster /> */}
        </Providers>

        {/* Analytics & Performance Monitoring */}
        {/* <Analytics /> */}
        {/* <SpeedInsights /> */}

        {/* Performance Observer for Core Web Vitals */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
                try {
                  const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                      }
                      if (entry.entryType === 'first-input') {
                        console.log('FID:', entry.processingStart - entry.startTime);
                      }
                      if (entry.entryType === 'layout-shift') {
                        if (!entry.hadRecentInput) {
                          console.log('CLS:', entry.value);
                        }
                      }
                    }
                  });
                  
                  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                } catch (e) {
                  console.log('Performance Observer not supported');
                }
              }
            `,
          }}
        />

        {/* Theme Color Meta for Dynamic Theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const setThemeColor = () => {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                  metaThemeColor.setAttribute('content', '#7C3AED');
                }
              };
              
              if (typeof window !== 'undefined') {
                setThemeColor();
                window.matchMedia('(prefers-color-scheme: dark)').addListener(setThemeColor);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
