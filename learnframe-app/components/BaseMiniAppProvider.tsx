'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MiniAppContext {
  user?: {
    fid?: number;
    username?: string;
    displayName?: string;
    wallet?: {
      address?: string;
    };
  };
  app?: {
    name?: string;
    version?: string;
  };
}

interface BaseMiniAppContextType {
  isReady: boolean;
  isMiniApp: boolean;
  context: MiniAppContext | null;
  user: MiniAppContext['user'] | null;
  openUrl: (url: string) => void;
  share: (text: string, url?: string) => void;
  requestPayment: (amount: string, token: string) => Promise<unknown>;
}

const BaseMiniAppContext = createContext<BaseMiniAppContextType | undefined>(undefined);

export function useBaseMiniApp() {
  const context = useContext(BaseMiniAppContext);
  if (context === undefined) {
    throw new Error('useBaseMiniApp must be used within a BaseMiniAppProvider');
  }
  return context;
}

interface BaseMiniAppProviderProps {
  children: ReactNode;
}

export function BaseMiniAppProvider({ children }: BaseMiniAppProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [user, setUser] = useState<MiniAppContext['user'] | null>(null);

  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        // Check if running in mini-app context
        const isInMiniApp = typeof window !== 'undefined' && 
                           !!(window as unknown as { webkit?: { messageHandlers?: { miniApp?: unknown } } })?.webkit?.messageHandlers?.miniApp;
        
        setIsMiniApp(isInMiniApp);

        if (isInMiniApp) {
          // Mock context for now since @farcaster/miniapp-sdk might not be available
          const mockContext: MiniAppContext = {
            user: {
              fid: 12345,
              username: 'testuser',
              displayName: 'Test User',
              wallet: {
                address: '0x1234...5678'
              }
            },
            app: {
              name: 'LearnFrame',
              version: '1.2.0'
            }
          };
          
          setContext(mockContext);
          setUser(mockContext.user || null);

          // Signal that app is ready (mock implementation)
          console.log('Mini-app ready!');
        }

        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize mini-app:', error);
        setIsReady(true); // Still allow app to work in regular browser
      }
    };

    initializeMiniApp();
  }, []);

  const openUrl = async (url: string) => {
    if (isMiniApp) {
      try {
        // Mock implementation - in real app this would use SDK
        console.log('Opening URL in mini-app:', url);
        window.open(url, '_blank');
      } catch (error) {
        console.error('Failed to open URL in mini-app:', error);
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const share = async (text: string, url?: string) => {
    if (isMiniApp) {
      try {
        // Mock implementation - in real app this would use SDK
        console.log('Sharing in mini-app:', { text, url });
        if (navigator.share) {
          await navigator.share({ text, url });
        }
      } catch (error) {
        console.error('Failed to share in mini-app:', error);
        if (navigator.share) {
          await navigator.share({ text, url });
        }
      }
    } else {
      if (navigator.share) {
        await navigator.share({ text, url });
      }
    }
  };

  const requestPayment = async (amount: string, token: string) => {
    if (isMiniApp && context) {
      try {
        // Mock implementation - in real app this would use SDK
        console.log('Payment request:', { amount, token });
        return { success: true, txHash: '0x123...' };
      } catch (error) {
        console.error('Payment request failed:', error);
        throw error;
      }
    }
    throw new Error('Payment not supported outside mini-app context');
  };

  const value: BaseMiniAppContextType = {
    isReady,
    isMiniApp,
    context,
    user,
    openUrl,
    share,
    requestPayment,
  };

  return (
    <BaseMiniAppContext.Provider value={value}>
      {children}
    </BaseMiniAppContext.Provider>
  );
}
