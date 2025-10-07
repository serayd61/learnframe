'use client';

import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { base } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './wagmi';
import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  // Initialize Farcaster SDK and call ready when loaded
  useEffect(() => {
    const initSDK = async () => {
      try {
        // Check if we're in a Farcaster context
        const context = await sdk.context;
        console.log('Farcaster context:', context);
        
        // Signal that the app is ready to be displayed
        sdk.actions.ready();
        console.log('✅ Farcaster SDK ready called');
      } catch (error) {
        console.log('Not in Farcaster context or error:', error);
        // Still call ready to hide splash screen
        sdk.actions.ready();
      }
    };

    initSDK();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          <RainbowKitProvider modalSize="compact">
            {props.children}
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
