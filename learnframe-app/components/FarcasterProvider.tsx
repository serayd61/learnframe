'use client';

import { useEffect, useState, createContext, useContext } from 'react';

interface FarcasterUser {
  fid?: number;
  username?: string;
}

interface FarcasterContext {
  user?: FarcasterUser;
}

interface FarcasterContextType {
  context: FarcasterContext | null;
  isLoading: boolean;
  user: FarcasterUser | null;
}

const FarcasterContextValue = createContext<FarcasterContextType>({
  context: null,
  isLoading: true,
  user: null,
});

export function useFarcaster() {
  return useContext(FarcasterContextValue);
}

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const sdk = (await import('@farcaster/frame-sdk')).default;
        const frameContext = await sdk.context;
        console.log('Frame context:', frameContext);
        setContext(frameContext as FarcasterContext);
        sdk.actions.ready();
        console.log('SDK ready() called!');
      } catch (error) {
        console.log('Frame SDK error or not in frame:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initializeSDK();
    }
  }, []);

  return (
    <FarcasterContextValue.Provider 
      value={{ 
        context, 
        isLoading,
        user: context?.user || null
      }}
    >
      {children}
    </FarcasterContextValue.Provider>
  );
}
