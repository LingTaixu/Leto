export interface Web3Feature {
  slug: string;
  badge: string;
  titleKey: string;
  descKey: string;
}

export const web3Features: Web3Feature[] = [
  {
    slug: "notary",
    badge: "NOT",
    titleKey: "web3.features.notaryTitle",
    descKey: "web3.features.notaryDesc",
  },
  {
    slug: "transfer",
    badge: "BSC",
    titleKey: "web3.features.transferTitle",
    descKey: "web3.features.transferDesc",
  },
];