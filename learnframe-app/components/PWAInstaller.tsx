'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      setTimeout(() => {
        if (!isStandalone) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  if (sessionStorage.getItem('installPromptDismissed') || (!showInstallPrompt && !isIOS)) {
    return null;
  }

  return (
    <AnimatePresence>
      {(showInstallPrompt || isIOS) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:right-4 md:left-auto md:w-96"
        >
          <div className="bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30 shadow-2xl">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📱</div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm mb-1">
                  Install LearnFrame App
                </h3>
                
                <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                  {isIOS 
                    ? 'Add to Home Screen for the best experience!'
                    : 'Get faster access, offline support, and notifications!'
                  }
                </p>

                <div className="flex space-x-2">
                  {!isIOS && deferredPrompt && (
                    <button
                      onClick={handleInstallClick}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-4 py-2 rounded-lg text-xs"
                    >
                      Install Now
                    </button>
                  )}
                  
                  <button
                    onClick={handleDismiss}
                    className="bg-white/10 text-gray-300 font-semibold px-4 py-2 rounded-lg text-xs"
                  >
                    Later
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
