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
  REWARD_ATOKEN_ACCOUNT,
  REWARD_TOKEN,
  VAULT_PDA,
  NFT_COLLECTION_NAME,
  METHODS,
  DAY_TIME
} = CONFIG;

function ClaimPage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState<any>([]);
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
    let nfts: any[] = [];
    // get nft data
    const provider = getProvider(connection, wallet!);
    const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
    const curChainTime = await getCurrentChainTime(connection);
    if (nftList[pool.toString()] && nftList[pool.toString()]?.length > 0) {
      for (let i = 0 ; i < nftList[pool.toString()].length; i ++) {
        let nft = nftList[pool.toString()][i];
        console.log('nft', nft);
        let [pool_data, bumpPool] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from(POOL_DATA_SEEDS), wallet!.publicKey!.toBuffer(), new PublicKey(nft.mint).toBuffer()],
          new PublicKey(PROGRAM_ID)
        );
        const data = await program.account.poolData.fetch(pool_data);
        const passedDays = await getDaysPassed(curChainTime!, data.startTime);
        const isFinished = (passedDays >=  METHODS[data.method].days);
        console.log('passedDays', passedDays);
        nfts.push({
          ...nft,
          ...METHODS[data.method],
          passedDays,
          isFinished
        });
      }
      console.log('nfts', nfts);
      setNfts(nfts);
    }
  }

  const makeClaimTransaction = async (nft: any) => {
    const provider = getProvider(connection, wallet!);
    const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);

    let instructions: any[] = [], signers: any[] = [];
    let [pool, bumpPool] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEEDS), wallet!.publicKey!.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    let [poolData, bumpPoolData] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_DATA_SEEDS), wallet!.publicKey!.toBuffer(), new PublicKey(nft.mint).toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    // check if pool has associated accounts to hold pirate, else create it
    const nftTransaction = await makeATokenAccountTransaction(connection, wallet!.publicKey, wallet!.publicKey, new PublicKey(nft.mint));
    instructions = [ ...instructions, ...nftTransaction.instructions ];
    signers = [ ...signers, ...nftTransaction.signers];
    const nftTo = nftTransaction.tokenTo;

    // check if pool has associated accounts to hold reward, else create it
    const tokenTransaction = await makeATokenAccountTransaction(connection, wallet!.publicKey, wallet!.publicKey, new PublicKey(REWARD_TOKEN));
    instructions = [ ...instructions, ...tokenTransaction.instructions ];
    signers = [ ...signers, ...tokenTransaction.signers];
    const tokenTo = tokenTransaction.tokenTo;

    console.log('nftTo', nftTo.toString());
    instructions.push(program.instruction.claim({
      accounts: {
        poolData: poolData,
        pool: pool,
        vault: new PublicKey(VAULT_PDA),
        user: wallet!.publicKey!,
        nftFrom: new PublicKey(nft.tokenAccount),
        nftTo: nftTo,
        tokenFrom: new PublicKey(REWARD_ATOKEN_ACCOUNT),
        tokenTo: tokenTo,
        tokenProgram: TOKEN_PROGRAM_ID
      }
    }));

    return { instructions, signers, nftTo }
  }

  const claim = async (index: number) => {
    try {
      setLoading(true)
      const instructionSet = [], signerSet = [];
      const { instructions, signers } = await makeClaimTransaction(nfts[index]);
      instructionSet.push(instructions);
      signerSet.push(signers);
      console.log('instructioset', instructionSet, 'signerset', signerSet);
      await sendTransactions(connection, wallet, instructionSet, signerSet);
      changeState(index);
      setLoading(false);
      addToast('Claiming success!', { appearance: 'success', autoDismiss: true });
    }
    catch (error) {
      console.log('error', error);
      setLoading(false);
      addToast('Claiming fail!', { appearance: 'error', autoDismiss: true });
    }
  }
  
  const changeState = async (curNftIndex: number) => {
    let newNFts = nfts.filter((_item: any, index: number) => index !== curNftIndex);
    setNfts(newNFts);
  }

  const handleRefresh = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  }

  const getDaysPassed = async (currentTime: number, startTime: number) => {
    const daysPassed = numberToFixed((currentTime - startTime) / DAY_TIME, 0);
    return daysPassed < 0 ? 0 : daysPassed;
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
            <p className={`on-hover`}>
              <Link to="/mystake">My Stakes</Link>
            </p>
            <p className={`on-hover active`}>
              <Link to="/claim" onClick={() => handleRefresh()}>CLAIM</Link>
            </p>
          </div>
        </div>
      }

      {
        wallet && <>
        <div className="nft-list-wrapper">
          <div className="border border-with-radius d-flex nft-list">
            {nfts.map((item:any, index:number) => 
              <div key={index} className={`${!item.isFinished && 'disabled'} border nft-item claim-item`}>
                <img src={item?.image} alt="NFT"/>

                <div className="stake-info">
                  <div className="info-text">
                    <div className="d-flex justify-content-between">
                      <p>{`${item.reward} $NAP`}  / day </p>
                      <p>{`${item.passedDays}/${item.days} days`}</p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p>Rewards: </p>
                      <p>{item.reward * item.days} $NAP</p>
                    </div>
                  </div>
                </div>

                {item.isFinished && 
                <div className="claim-button">
                  <button className="on-hover" onClick={() => {claim(index)}} key={index}>Claim</button>
                </div>
                }
              </div>
            )}
          </div>
        </div>
        {/* <div className=" text-center white total-reward">
          Total Rewards: { totalReward } Booty
        </div> */}
        </>
      }
    </div>
  )
}

export default ClaimPage;

