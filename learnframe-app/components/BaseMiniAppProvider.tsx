'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface BaseMiniAppContextType {
  isReady: boolean;
  isMiniApp: boolean;
  context: any;
  user: any;
  openUrl: (url: string) => void;
  share: (text: string, url?: string) => void;
  requestPayment: (amount: string, token: string) => Promise<any>;
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
  const [context, setContext] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        // Check if running in mini-app context
        const isInMiniApp = typeof window !== 'undefined' && 
                           (window as any).webkit?.messageHandlers?.miniApp;
        
        setIsMiniApp(isInMiniApp);

        if (isInMiniApp) {
          // Initialize Farcaster Mini-App SDK
          const context = await sdk.context;
          setContext(context);
          
          // Get user information
          if (context?.user) {
            setUser(context.user);
          }

          // Signal that app is ready
          await sdk.actions.ready();
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
        await sdk.actions.openUrl(url);
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
        await sdk.actions.share({ text, url });
      } catch (error) {
        console.error('Failed to share in mini-app:', error);
        // Fallback to web share API
        if (navigator.share) {
          navigator.share({ text, url });
        }
      }
    } else {
      if (navigator.share) {
        navigator.share({ text, url });
      }
    }
  };

  const requestPayment = async (amount: string, token: string) => {
    if (isMiniApp && context) {
      try {
        return await sdk.actions.requestPayment({
          amount,
          token,
          recipient: context.user?.wallet?.address
        });
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
