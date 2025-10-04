'use client';

import { useEffect, useState, createContext, useContext } from 'react';

interface FarcasterContextType {
  context: unknown;
  isLoading: boolean;
  user: unknown;
}

const FarcasterContext = createContext<FarcasterContextType>({
  context: null,
  isLoading: true,
  user: null,
});

export function useFarcaster() {
  return useContext(FarcasterContext);
}

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const sdk = (await import('@farcaster/frame-sdk')).default;
        const frameContext = await sdk.context;
        console.log('Frame context:', frameContext);
        setContext(frameContext);
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
    <FarcasterContext.Provider 
      value={{ 
        context, 
        isLoading,
        user: (context as any)?.user || null
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}
