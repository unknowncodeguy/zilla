import { devnet } from '../constants/cluster';

export const CLUSTER_API = devnet;
export const CLUSTER = 'devnet';
export const COMMITMENT = 'finalized';
export const NFT_UPDATE_AUTHORITY = '7XXCX1NUA8kYXYw5GMwgogdUqq5pUdL5qbpQJyn9dDRh';
export const NFT_COLLECTION_NAME = 'Zillas Vs Kongz';
export const PROGRAM_ID = '9YLdDL5yCXeNEqq2QUwXWC2t4yhk688NvvHiAbaqEUka';
export const VAULT_PDA = 'GYCveBrnYWSJC6yiZgobc9a4u9o9c7zPjWQFhHCCtzom';
export const REWARD_ATOKEN_ACCOUNT = 'EH7nJggFDrLoLLgm5xkMeLKaA3irafng5khFCpomswbg';
export const REWARD_TOKEN = 'GnBw4qZs3maF2d5ziQmGzquQFnGV33NUcEujTQ3CbzP3';
export const POOL_SEEDS = 'pool';
export const POOL_DATA_SEEDS = 'pool data';
export const VAULT_SEEDS = 'rewards vault';
export const METHODS = [
  {days: 5, reward: 1},
  {days: 15, reward: 2},
  {days: 30, reward: 3}
];
export const DAY_TIME = 10;