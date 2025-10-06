import { MiniAppConfig } from '@farcaster/miniapp-sdk';

export const miniAppConfig: MiniAppConfig = {
  name: 'LearnFrame',
  description: 'Learn blockchain, earn LEARN tokens on Base',
  icon: '/icon.png',
  version: '1.0.0',
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
