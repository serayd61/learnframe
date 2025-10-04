'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import sdk, { type FrameContext } from '@farcaster/frame-sdk';

interface FarcasterContextType {
  context: FrameContext | null;
  isLoading: boolean;
  user: any;
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
  const [context, setContext] = useState<FrameContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // SDK'nın yüklenmesini bekle
        if (typeof window !== 'undefined') {
          // Context'i al
          const frameContext = await sdk.context;
          console.log('Frame context loaded:', frameContext);
          setContext(frameContext);
          
          // SDK hazır olduğunu bildir - ÖNEMLİ!
          await sdk.actions.ready();
          console.log('SDK ready() called successfully');
          setIsSDKLoaded(true);
        }
      } catch (error) {
        console.log('Not in Frame context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <FarcasterContext.Provider 
      value={{ 
        context, 
        isLoading,
        user: context?.user || null
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}
