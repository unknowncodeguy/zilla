import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
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

function ClaimPage() {
  const walletState = useWallet();
  const wallet = useAnchorWallet();

  const { connection } = useConnection();

  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState<any>([]);

  const { addToast } = useToasts();

  const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API } as SolanaClientProps);

  const getProvider = () => {
    if (wallet)
		  return new anchor.Provider(connection, wallet, COMMITMENT as anchor.web3.ConfirmOptions);
	}

  const getClaim = (index: number) => {
    addToast('Get Reward', { appearance: 'success' });
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
        setNfts([...lists]);
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
            <p className={`on-hover`}>
              <Link to="/stake">STAKE</Link>
            </p>
            <p className={`on-hover active`}>
              <Link to="/claim">CLAIM</Link>
            </p>
          </div>
        </div>
      }

      {
        walletState.connected && <>
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

export default ClaimPage;

