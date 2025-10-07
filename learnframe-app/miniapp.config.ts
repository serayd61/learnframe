import MiniAppConfig from '@farcaster/miniapp-sdk';

export const miniAppConfig = {
  name: 'LearnFrame',
  description: 'Learn blockchain, earn LEARN tokens on Base',
  icon: '/icon.png',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://learnframe.vercel.app',
  version: '1.2.0',
  permissions: [
    'wallet.connect',
    'wallet.send',
    'notifications.push',
    'storage.local'
  ],
  categories: ['education', 'defi', 'games'],
  supportedNetworks: ['base'],
  minFrameVersion: '0.1.0',
  orientation: 'portrait'
};
