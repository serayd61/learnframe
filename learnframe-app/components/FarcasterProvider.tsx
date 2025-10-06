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
  sdk: any;
}

const FarcasterContextValue = createContext<FarcasterContextType>({
  context: null,
  isLoading: true,
  user: null,
  sdk: null,
});

export function useFarcaster() {
  return useContext(FarcasterContextValue);
}

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sdk, setSdk] = useState<any>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const farcasterSDK = (await import('@farcaster/frame-sdk')).default;
        const frameContext = await farcasterSDK.context;
        console.log('✅ Frame context loaded:', frameContext);
        
        setContext(frameContext as FarcasterContext);
        setSdk(farcasterSDK);
        
        farcasterSDK.actions.ready();
        console.log('✅ SDK ready() called!');
      } catch (error) {
        console.log('⚠️ Frame SDK error or not in frame:', error);
        setContext(null);
        setSdk(null);
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
        user: context?.user || null,
        sdk
      }}
    >
      {children}
    </FarcasterContextValue.Provider>
  );
}
