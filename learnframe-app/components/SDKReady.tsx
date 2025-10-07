'use client';

import { useEffect } from 'react';

export default function SDKReady() {
  useEffect(() => {
    const callReady = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        sdk.actions.ready();
        console.log('✅ SDK ready() called successfully');
      } catch {
        console.log('Not in Farcaster context or SDK error');
      }
    };
    
    callReady();
  }, []);

  return null;
}
