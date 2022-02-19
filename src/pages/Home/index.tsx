import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
  Outlet
} from "react-router-dom";
import * as anchor from '@project-serum/anchor';
import { useConnection, useWallet, useAnchorWallet  } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { 
  PublicKey,
  SystemProgram,
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { useToasts } from 'react-toast-notifications'
import { AccountLayout, Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";

import { SolanaClient, SolanaClientProps } from '../../helpers/sol';
import { 
  CREATOR_ADDRESS,
  COMMITMENT,
  CLUSTER_API, 
  PROGRAM_ID,
  FIRE_TOKEN_MINT
} from '../../config/main.js';
import { IDL } from '../../constants/idl'

import { getAccountInfo, getTokenAccountByOwner } from '../../api/api';
import { sendTransactions } from '../../helpers/sol/connection';

import {getImg} from './../../utils/Helper'

import './index.css';

function HomePage() {
  const walletState = useWallet();
  const wallet = useAnchorWallet();

  const { connection } = useConnection();

  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState<any>([]);
  const [nftsStaked, setNftsStaked] = useState<any>([]);
  const [nftForStaking, setNftForStaking] = useState(-1);
  const [page, setPage]  = useState(`stake`);
  const [schedule, setSchedule]  = useState<any>([]);

  const { addToast } = useToasts();

  const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API } as SolanaClientProps);

  const getProvider = () => {
    if (wallet)
		  return new anchor.Provider(connection, wallet, COMMITMENT as anchor.web3.ConfirmOptions);
	}

  const viweStake = (index: number) => {
    setNftForStaking(index)
    const nft = nfts[index];
  }

  const getClaim = (index: number) => {
    addToast('Get Reward', { appearance: 'success' });
  }

  const getStaking = (index: number) => {
    addToast('Get Staking', { appearance: 'success' });
  }
  
  useEffect(() => {
    (async () => {
      
      if (walletState.connected) {
        setLoading(true);
        const lists = [
          {
            image: `01.png`,
            name: `01`,
          },
          {
            image: `02.png`,
            name: `02`
          },
          {
            image: `03.png`,
            name: `03`
          },
          {
            image: `02.png`,
            name: `04`
          },
          {
            image: `01.png`,
            name: `05`
          },
          {
            image: `02.png`,
            name: `06`
          },
          {
            image: `02.png`,
            name: `07`
          },
          {
            image: `01.png`,
            name: `08`
          },
          {
            image: `03.png`,
            name: `09`
          },
          {
            image: `03.png`,
            name: `10`
          },
          {
            image: `01.png`,
            name: `11`
          }
        ];

        setSchedule([
          {days: 2, percentage: 10},
          {days: 15, percentage: 20},
          {days: 30, percentage: 50}
        ]);

        setNfts([...lists]);
        setNftsStaked([...lists]);
        setLoading(false);
      }
    })()
  }, [walletState.connected]);
  
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
        !walletState.connected &&  
        <div className="wallet-button-wrapper">
          <WalletMultiButton className='wallet-button font-grey-light'/>
        </div>
      }

      {
        walletState.connected &&  
        <div className="menu">
          <div className="menu-wrapper d-flex justify-content-center">
            <p className={`on-hover ${page == `stake` && `active`}`}  onClick={() => {setPage(`stake`); setNftForStaking(-1)}}>
              STAKE
            </p>
            <p className={`on-hover ${page == `claim` && `active`}`} onClick={() => setPage(`claim`)}>
              CLAIM
            </p>
          </div>
        </div>
      }

      {
        walletState.connected && page === `stake` && nftForStaking != -1 &&
        <div className="nft-staking-wrapper">
          <div className="border border-with-radius d-flex justify-content-between text-center nft-staking" style={{backgroundImage: `url('${process.env.PUBLIC_URL}/bg.png')`}}>
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
                  <p>{item.percentage} / DAY</p>
                </div>

                <div className="schedule-percentage text-center">
                  <button className="on-hover" onClick={() => {getStaking(index)}}>STAKE</button>
                </div>
              </div>
            })}
          </div>
        </div>
      }

      {
        walletState.connected && page === `stake` && nftForStaking < 0 &&
        <div className="nft-list-wrapper">
          <div className="border border-with-radius d-flex nft-list ">
            {nfts.map((item:any, index:number) => 
              <div className="border on-hover nft-item stake-item" onClick={() => viweStake(index)} key={index}>
                <img src={getImg(`images/nfts/${item.image}`)} alt="NFT Image"/>
              </div>
            )}
          </div>
        </div>
      }

      {
        walletState.connected && page === `claim` && <>
        <div className="nft-list-wrapper">
          <div className="border border-with-radius d-flex nft-list">
            {nfts.map((item:any, index:number) => 
              <div key={index} className={`${index % 3 == 0 && 'disabled'} border nft-item claim-item`}>
                <img src={getImg(`images/nfts/${item.image}`)} alt="NFT Image"/>

                <div className="stake-info">
                  <div className="info-text">
                    <div className="d-flex justify-content-between">
                      <p>{5}/day </p>
                      <p>{index % 3 == 0 ? `Finished` : `15/30 days`}</p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p>Total Booty: </p>
                      <p>{150}</p>
                    </div>
                  </div>
                </div>

                {index % 3 != 0 && 
                <div className="claim-button">
                  <button className="on-hover" onClick={() =>  index % 3 != 0 && getClaim(index)} key={index}>Claim</button>
                </div>
                }
              </div>
            )}
          </div>
        </div>
        <div className=" text-center white total-reward">
          Total Rewards: 1000 Booty
        </div>
        </>
      }

    </div>
  )
}

export default HomePage;
function item(item: any, index: any): import("react").ReactNode {
  throw new Error('Function not implemented.');
}

function index(item: any, index: any): import("react").ReactNode {
  throw new Error('Function not implemented.');
}

