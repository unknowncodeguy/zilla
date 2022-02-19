import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import * as anchor from '@project-serum/anchor';
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { TOKEN_PROGRAM_ID} from "@solana/spl-token";
import { useToasts } from 'react-toast-notifications'

import { SolanaClient, SolanaClientProps } from '../../helpers/sol';
import CONFIG from '../../config';
import { IDL } from '../../constants/idl'
import {getCurrentChainTime, getImg, getProvider, makeATokenAccountTransaction, numberToFixed} from '../../utils/Helper'
import { sendTransactions } from '../../helpers/sol/connection';
import './index.css';

const { PublicKey } = anchor.web3;
const { 
  CLUSTER_API, 
  NFT_UPDATE_AUTHORITY, 
  PROGRAM_ID, 
  POOL_SEEDS, 
  POOL_DATA_SEEDS, 
  VAULT_PDA,
  NFT_COLLECTION_NAME,
  METHODS
} = CONFIG;

function MyStakePage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [totalStakes, setTotalStakes] = useState(0);
  const [myStakes, setMyStakes] = useState(0);
  const [dailyReward, setDailyReward] = useState(0);
  const [pendingReward, setPendingReward] = useState(0);
  const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API } as SolanaClientProps);
  const { addToast } = useToasts();

  useEffect(() => {
    (async () => {
      if (wallet) {
        setLoading(true);
        await loadData();
        setLoading(false);
      }
    })()
  }, [wallet]);
  
  const loadData = async () => {
    // get nfts from pool
    let [pool, bumpPool] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEEDS), wallet!.publicKey!.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );
    const wallets = [pool.toString()];
    let nftList = await solanaClient.getAllCollectibles(wallets, [
        { updateAuthority: NFT_UPDATE_AUTHORITY, collectionName: NFT_COLLECTION_NAME }
    ]);
    console.log('result', nftList);
    // get nft data
    const provider = getProvider(connection, wallet!);
    const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
    let pendingReward = 0, dailyReward = 0, totalStakes = 0, myStakes = 0;
    const vaultData = await program.account.vault.fetch(new PublicKey(VAULT_PDA));
    totalStakes =vaultData.totalCount;
    if (nftList[pool.toString()] && nftList[pool.toString()]?.length > 0) {
      for (let i = 0 ; i < nftList[pool.toString()].length; i ++) {
        let nft = nftList[pool.toString()][i];
        console.log('nft', nft);
        let [pool_data, bumpPool] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from(POOL_DATA_SEEDS), wallet!.publicKey!.toBuffer(), new PublicKey(nft.mint).toBuffer()],
          new PublicKey(PROGRAM_ID)
        );
        const data = await program.account.poolData.fetch(pool_data);
        myStakes ++;
        dailyReward += METHODS[data.method].reward;
        pendingReward += METHODS[data.method].reward * METHODS[data.method].days;
      }
    }

    setTotalStakes(totalStakes);
    setMyStakes(myStakes);
    setDailyReward(dailyReward);
    setPendingReward(pendingReward);
    
  }

  const handleRefresh = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  }

  return (
    <div className="container">
      <img id="backImg" src={getImg('images/background.png')} alt="Background" />
      {
        loading && <div id="preloader"></div>
      }
      <header className="text-center text-shadow">
        <Link to='/'><h1>STAKING</h1></Link>
      </header>

      {
        !wallet &&  
        <div className="wallet-button-wrapper">
          <WalletMultiButton className='wallet-button font-grey-light'/>
        </div>
      }

      {
        wallet &&  
        <div className="menu">
          <div className="menu-wrapper d-flex justify-content-center">
            <p className={`on-hover`}>
              <Link to="/stake">STAKE</Link>
            </p>
            <p className={`on-hover active`}>
              <Link to="/mystake">My Stakes</Link>
            </p>
            <p className={`on-hover`}>
              <Link to="/claim" onClick={() => handleRefresh()}>CLAIM</Link>
            </p>
          </div>
        </div>
      }

      {
        wallet && <>
        <div className="nft-list-wrapper">
          <div className="border border-with-radius d-flex nft-list">
            <div className="mystake-text">
              <p>Total STAKES : {totalStakes}</p>
              <p>MY TOTAL STAKES : {myStakes}</p>
              <p>DAILY REWARDS : {dailyReward} $NAP</p>
              <p>PENDING REWARDS : {pendingReward} $NAP</p>
            </div>
          </div>
        </div>
        </>
      }
    </div>
  )
}

export default MyStakePage;

