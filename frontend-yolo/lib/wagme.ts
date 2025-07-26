import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'

// 定义 Injective EVM 测试网
const injectiveEvmTestnet = {
  id: 1439,
  name: 'Injective EVM Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://k8s.testnet.json-rpc.injective.network/'] },
  },
  blockExplorers: {
    default: { name: 'Injective Blockscout', url: 'https://testnet.blockscout.injective.network/' },
  },
}

export const config = createConfig({
  chains: [injectiveEvmTestnet],
  connectors: [
    injected(), // 支持 MetaMask, Rabby, 等浏览器注入式钱包
  ],
  transports: {
    [injectiveEvmTestnet.id]: http(),
  },
}) 