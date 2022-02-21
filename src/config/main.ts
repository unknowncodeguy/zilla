import { mainnet } from '../constants/cluster';

export const CLUSTER_API = mainnet;
export const CLUSTER = 'mainnet-beta';
export const COMMITMENT = 'finalized';
export const NFT_UPDATE_AUTHORITY = '7XXCX1NUA8kYXYw5GMwgogdUqq5pUdL5qbpQJyn9dDRh';
export const NFT_COLLECTION_NAME = 'Zillas Vs Kongz';
export const PROGRAM_ID = 'G6K4fGG59FAg884hgSMLiUx4BMurQ6jBq46aNuKwiMZ1';
export const VAULT_PDA = 'B1fkBC4SLnd6PUtQPyBNp3WgKwz3hXMkbBtEq2jUuChJ';
export const REWARD_ATOKEN_ACCOUNT = '2w9fkWrQbkmW6Rt3NcVBid3B8dk1A6MTtAiPnAcUfHCS';
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