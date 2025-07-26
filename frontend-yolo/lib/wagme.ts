import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'

// 定义 Injective 测试网
const injectiveTestnet = {
  id: 4242,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.injective.network'] },
  },
  blockExplorers: {
    default: { name: 'Injective Explorer', url: 'https://testnet.explorer.injective.network' },
  },
}

export const config = createConfig({
  chains: [injectiveTestnet],
  connectors: [
    injected(), // 支持 MetaMask, Rabby, 等浏览器注入式钱包
  ],
  transports: {
    [injectiveTestnet.id]: http(),
  },
}) 