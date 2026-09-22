export interface Web3Feature {
  slug: string;
  title: string;
  badge: string;
  description: string;
}

export const web3Features: Web3Feature[] = [
  {
    slug: "notary",
    title: "数据存证",
    badge: "NOT",
    description:
      "连接钱包，将一段不超过 64 字节的数据写入 BSC Testnet 链上事件日志，哈希即证据，永久可查、不可篡改。",
  },
  {
    slug: "transfer",
    title: "原生币转账",
    badge: "BSC",
    description:
      "查询任意地址的 BSC Testnet BNB 余额，并连接钱包发起原生币转账，等待回执并展示交易状态。",
  },
];