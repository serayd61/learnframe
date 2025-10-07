'use client';

import { useEffect, useState, createContext, useContext } from 'react';

interface FarcasterUser {
  fid?: number;
  username?: string;
}

interface FarcasterContext {
  user?: FarcasterUser;
}

interface EthProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

interface FarcasterSDK {
  context: Promise<FarcasterContext>;
  actions: {
    ready: () => void;
  };
  wallet: {
    ethProvider: EthProvider;
  };
}

interface FarcasterContextType {
  context: FarcasterContext | null;
  isLoading: boolean;
  user: FarcasterUser | null;
  sdk: FarcasterSDK | null;
  ethProvider: EthProvider | null;
  isConnected: boolean;
}

const FarcasterContextValue = createContext<FarcasterContextType>({
  context: null,
  isLoading: true,
  user: null,
  sdk: null,
  ethProvider: null,
  isConnected: false,
});

export function useFarcaster() {
  return useContext(FarcasterContextValue);
}

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sdk, setSdk] = useState<FarcasterSDK | null>(null);
  const [ethProvider, setEthProvider] = useState<EthProvider | null>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const farcasterSDK = (await import("@farcaster/miniapp-sdk")).sdk;
        const frameContext = await farcasterSDK.context;
        console.log('✅ Frame context loaded:', frameContext);
        
        setContext(frameContext as FarcasterContext);
        setSdk(farcasterSDK);
        
        // Get the ethereum provider from Farcaster wallet
        if (farcasterSDK.wallet?.ethProvider) {
          setEthProvider(farcasterSDK.wallet.ethProvider);
          console.log('✅ Farcaster wallet provider available!');
        } else {
          console.log('⚠️ Farcaster wallet provider not available');
        }
        
        farcasterSDK.actions.ready();
        console.log('✅ SDK ready() called!');
      } catch (error) {
        console.log('⚠️ Frame SDK error or not in frame:', error);
        setContext(null);
        setSdk(null);
        setEthProvider(null);
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
        sdk,
        ethProvider,
        isConnected: !!ethProvider && !!context?.user
      }}
    >
      {children}
    </FarcasterContextValue.Provider>
  );
}
