import { devnet } from '../constants/cluster';

export const CLUSTER_API = devnet;
export const CLUSTER = 'devnet';
export const COMMITMENT = 'finalized';
export const NFT_UPDATE_AUTHORITY = '5FVEye7HEo7Sq5fQLDuBP4NQKp4uKXUcw8WxERy8nAiF';
export const NFT_COLLECTION_NAME = 'Dope Pirates';
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