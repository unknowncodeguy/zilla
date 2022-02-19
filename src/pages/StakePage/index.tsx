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
import {getImg, getProvider, makeATokenAccountTransaction} from './../../utils/Helper'
import './index.css';
import { sendTransactions } from '../../helpers/sol/connection';
import { VAULT_PDA } from '../../config/dev';

const { PublicKey, SystemProgram } = anchor.web3;
const { 
  CLUSTER_API, 
  NFT_UPDATE_AUTHORITY, 
  PROGRAM_ID, 
  POOL_SEEDS, 
  POOL_DATA_SEEDS, 
  NFT_COLLECTION_NAME,
  METHODS
} = CONFIG;


function StakePage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState<any>([]);
  const [curNftIndex, setCurNftIndex] = useState(-1);
  const [schedule, setSchedule]  = useState<any>([]);
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
    setCurNftIndex(-1);
    // get nfts from wallet
    const wallets = [wallet!.publicKey!.toString()];
    console.log('collection name', NFT_COLLECTION_NAME);
    let nftList = await solanaClient.getAllCollectibles(wallets, [
        { updateAuthority: NFT_UPDATE_AUTHORITY, collectionName: NFT_COLLECTION_NAME }
    ]);
    console.log('result', nftList);
    if (nftList[wallet!.publicKey!.toString()] && nftList[wallet!.publicKey!.toString()]?.length > 0) {
      setNfts(nftList[wallet!.publicKey!.toString()]);
    }

    setSchedule(METHODS);
  }

  const viewPlan = (index: number) => {
    setCurNftIndex(index);
  }

  const makeStakeTransaction = async (nft: any, method: number) => {
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

    // check if pool account is exist, else create it
    const poolInfo:any = await connection.getAccountInfo(pool);
    console.log('poolInfo', poolInfo);
    if (!poolInfo) {
      instructions.push(program.instruction.createPool(bumpPool, {
        accounts: {
          pool: pool,
          user: wallet!.publicKey!,
          systemProgram: SystemProgram.programId
        }
      }));
    }

     // check if poolData account is exist, else create it
     const poolDataInfo:any = await connection.getAccountInfo(poolData);

     if (!poolDataInfo) {
       instructions.push(program.instruction.createPoolData(bumpPoolData, {
         accounts: {
           poolData: poolData,
           mint: new PublicKey(nft.mint),
           user: wallet!.publicKey!,
           systemProgram: SystemProgram.programId
         }
       }))
     }

    // check if pool has associated accounts to hold nft, else create it
    const transaction = await makeATokenAccountTransaction(connection, wallet!.publicKey, pool, new PublicKey(nft.mint));
    instructions = [ ...instructions, ...transaction.instructions ];
    signers = [ ...signers, ...transaction.signers];
    const nftTo = transaction.tokenTo;
    console.log('nftTo', nftTo.toString());
    instructions.push(program.instruction.stake(method, {
      accounts: {
        poolData: poolData,
        pool: pool,
        vault: new PublicKey(VAULT_PDA),
        user: wallet!.publicKey!,
        nftFrom: new PublicKey(nft.tokenAccount),
        nftTo: nftTo,
        tokenProgram: TOKEN_PROGRAM_ID
      }
    }));

    return { instructions, signers, nftTo }
  }

  const stake = async (method: number) => {
    try {
      setLoading(true)
      const instructionSet = [], signerSet = [];
      const { instructions, signers } = await makeStakeTransaction(nfts[curNftIndex], method);
      instructionSet.push(instructions);
      signerSet.push(signers);
      console.log('instructioset', instructionSet, 'signerset', signerSet);
      await sendTransactions(connection, wallet, instructionSet, signerSet);
      changeState();
      setLoading(false);
      addToast('Staking success!', { appearance: 'success', autoDismiss: true });
    }
    catch (error) {
      console.log('error', error);
      setLoading(false);
      addToast('Staking fail!', { appearance: 'error', autoDismiss: true });
    }
  }
  
  const changeState = async () => {
    let newNFts = nfts.filter((_item: any, index: number) => index !== curNftIndex);
    setNfts(newNFts);
    setCurNftIndex(-1);
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
            <p className={`on-hover active`}  onClick={() => handleRefresh()}>
              <Link to="/stake">STAKE</Link>
            </p>
            <p className={`on-hover`}>
              <Link to="/mystake">My Stakes</Link>
            </p>
            <p className={`on-hover`}>
              <Link to="/claim" onClick={() => handleRefresh()}>CLAIM</Link>
            </p>
          </div>
        </div>
      }

      {
        wallet && curNftIndex !== -1 &&
        <div className="nft-staking-wrapper">
          <div className="border border-with-radius d-flex justify-content-between text-center nft-staking" style={{backgroundImage: `url('/bg.png')`}}>
            {schedule.map((item: any, index: any) => {
              let p = 0;
              return <div className="border border-with-radius stake-schedule" key={index}>
                <div className="schedule-table">
                  <table>
                    <tbody>
                      {
                        Array.apply(null, new Array(5)).map((value, index) => {
                          return <tr key={index}>
                          {
                            Array.apply(null, new Array(7)).map((value, index) => {
                              p++;
                              return <td key={index} className={`${p < (item.days + 1) && 'filled'} ${p > 30 && 'lasted'}`}></td>
                            })
                          }                         
                          </tr>

                        })
                      }
                    </tbody>
                  </table>
                </div>
                <div className="schedule-day">
                  <p>{item.days} DAYS</p>
                </div>
                <div className="per-day">
                  <p>{item.reward} / DAY</p>
                </div>

                <div className="schedule-percentage text-center">
                  <button className="on-hover" onClick={() => {stake(index)}}>STAKE</button>
                </div>
              </div>
            })}
          </div>
        </div>
      }

      {
        wallet && curNftIndex < 0 &&
        <div className="nft-list-wrapper">
          <div className="border border-with-radius d-flex nft-list ">
            {nfts.map((item:any, index:number) => 
              <div className="border on-hover nft-item stake-item" onClick={() => viewPlan(index)} key={index}>
                <img src={item?.image} alt="NFT"/>
              </div>
            )}
          </div>
        </div>
      }
    </div>
  )
}

export default StakePage;

