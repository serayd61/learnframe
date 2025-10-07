'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { FarcasterProvider } from '@/components/FarcasterProvider';
import '@rainbow-me/rainbowkit/styles.css';
import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// Hybrid config: RainbowKit for external wallets + Farcaster integration
const config = getDefaultConfig({
  appName: 'LearnFrame',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id',
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize Farcaster Mini App SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        // Call ready to hide splash screen
        await sdk.actions.ready();
        console.log('✅ Farcaster Mini App SDK ready');
      } catch (error) {
        console.log('SDK error:', error);
      }
    };
    initSDK();
  }, []);

  return (
    <FarcasterProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </FarcasterProvider>
  );
}
