export const CONTRACT_ADDRESS =
  "0x3211E60F2D10a200362795C580097A4f9bbc6DdA";

export const DEPLOY_BLOCK = 132286769;

export const EVENT_TOPIC0 =
  "0x541e3f905dc106b00597232a3f1cc4a6ee78c15301e6f25f66456fdc42ddc62f";

export const MAX_DATA_LENGTH = 64;

export const abi = [
  {
    inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "Stored",
    type: "event",
  },
] as const;
