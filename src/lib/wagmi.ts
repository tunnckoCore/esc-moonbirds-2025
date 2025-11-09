import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Ethscriptions Moonbirds',
  projectId: 'moonbirds-ethscriptions',
  chains: [mainnet],
  ssr: true,
});
