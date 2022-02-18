import { useState, useEffect } from 'react'
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

import Button from "../../components/Button/index";
import Header from "../../components/Header";
import Footer from '../../components/Footer';
import EggBox from "../../components/EggBox";
import ExploreModal from "../../components/ExploreModal";
import { SolanaClient, SolanaClientProps } from '../../helpers/sol';
import { 
  CREATOR_ADDRESS,
  COMMITMENT,
  CLUSTER_API, 
  PROGRAM_ID,
  FIRE_TOKEN_MINT
} from '../../config/main.js';
import { IDL } from '../../constants/idl'
import './index.css';
import { getAccountInfo, getTokenAccountByOwner } from '../../api/api';
import { sendTransactions } from '../../helpers/sol/connection';

const lockingPeriod = [
  {
      title: "Land1",
      fireCountTeenage: 90,
      fireCountKing: 300,
      lp: '2 Weeks',
      image: 'CAVE_vulcano.png'
  },
  {
      title: "Land2",
      fireCountTeenage: 140,
      fireCountKing: 360,
      lp: '1 Month',
      image: 'CAVE_desert.png'
  },
  {
      title: "Land3",
      fireCountTeenage: 210,
      fireCountKing: 525,
      lp: '2 Months',
      image: 'CAVE_antartica.png'
  }
]

function HomePage() {
  const walletState = useWallet();
  const wallet = useAnchorWallet();
  const [drakes, setDrakes] = useState([
    {
      imageUrl: '',
      size: '',
      mint: '',
      tokenAccount: '',
      name: ''
    },
  ]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [currentDrake, setCurrentDrake] = useState(-1);
  const [loading, setLoading] = useState(-1);
  const { connection } = useConnection();
  const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API } as SolanaClientProps);
  const { addToast } = useToasts()

  const [fireCount, setFireCount] = useState(0)
  const [openExplore, setOpenExplore] = useState(false)

  const selectEgg = (id: any) => {
      setCurrentDrake(id);
      setSelectAll(false);
      setOpenExplore(true)
  }

  const selectAll = () => {
      console.log('click select all')
      setSelectAll(true);
      setOpenExplore(true)
  }

  const getProvider = () => {
    if (wallet)
		  return new anchor.Provider(connection, wallet, COMMITMENT as anchor.web3.ConfirmOptions);
	}
  
  const makeTransaction = async (program: anchor.Program<any>, poolSigner: PublicKey, pool: PublicKey, index:number, land: number) => {
    const aTokenAccount = new Keypair();
    const aTokenAccountRent = await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span
    )
    const drake = drakes[index];
    let transaction = [];
    let signers:any[] = [];
    if (!walletState.publicKey)
      return;
    
    transaction.push(SystemProgram.createAccount({
      fromPubkey: walletState.publicKey,
      newAccountPubkey: aTokenAccount.publicKey,
      lamports: aTokenAccountRent,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID
    }));
    transaction.push(Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      new PublicKey(drake.mint),
      aTokenAccount.publicKey,
      poolSigner
    ));
    
    signers.push(aTokenAccount);
    
    console.log('to account', aTokenAccount.publicKey.toString())
    let type = drake.size === 'teenage' ? 1 : 2;
    transaction.push(program.instruction.addNft(land + 1, type, {
      accounts: {
        user: walletState.publicKey,
        mint: drake.mint,
        pool: pool,
        from: new PublicKey(drake.tokenAccount),
        to: aTokenAccount.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId, 
        rent: SYSVAR_RENT_PUBKEY
      },
      signers
    }));
    return { transaction, signers };
  }

  const clickSend = async (land: number) => {
    setLoading(1);
		const provider = getProvider();
		const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
    console.log('programId', PROGRAM_ID);
    console.log('new programId', program.programId.toString());
    try {
      if (!walletState.publicKey) {
        addToast("Connect your wallet!", {
          appearance: 'warning',
          autoDismiss: true,
        })
        setLoading(-1)
        return;
      }
      
      if (land < 0 || land > 2) {
        addToast("Select land!", {
          appearance: 'warning',
          autoDismiss: true,
        })
        setLoading(-1)
        return;
      } 
      
      setOpenExplore(false);
      let instructionSet= [], signerSet = [];
      let [pool, _nonce] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('pool1'), walletState.publicKey.toBuffer()],
        program.programId
      );
      let [poolSigner, _nonceSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('pool1 signer'), walletState.publicKey.toBuffer()],
        program.programId
      );
      console.log('pool', pool.toString());
      console.log('pool signer', poolSigner.toString());
      const { result } = await getAccountInfo(pool.toBase58());
      console.log('result', result);
      if (!result.value) {
        let transaction = [];
        transaction.push(program.instruction.createUserPool(_nonce, _nonceSigner, {
          accounts: {
            pool: pool,
            poolSigner: poolSigner,
            user: walletState.publicKey,
            systemProgram: SystemProgram.programId
        }}));
        instructionSet.push(transaction);
        signerSet.push([]);
      }
      if (isSelectAll) {
        for (let i = 0; i < drakes.length; i ++) {
          let newTx: any = await makeTransaction(program, poolSigner, pool, i, land);
          instructionSet.push(newTx.transaction);
          signerSet.push(newTx.signers);
        }
        await sendTransactions(connection, walletState, instructionSet, signerSet)
        setDrakes([]);
      }
      else {
        if (currentDrake < 0 || currentDrake > drakes.length - 1) {
          addToast("Select NFT!", {
            appearance: 'warning',
            autoDismiss: true,
          })
          setLoading(-1)
          return;
        }
        let newTx:any = await makeTransaction(program, poolSigner, pool, currentDrake, land);
        instructionSet.push(newTx.transaction);
        signerSet.push(newTx.signers);
        await sendTransactions(connection, walletState, instructionSet, signerSet);
        setDrakes(drakes.filter((drake, idx: number) => idx !== currentDrake))
      }
      const data = await program.account.pool.fetch(pool);
      console.log('data', data.nfts);
      setLoading(-1);
      setCurrentDrake(-1);
    }
    catch (error) {
      console.log('error', error);
      addToast("Staking failed!", {
        appearance: 'error',
        autoDismiss: true,
      })
      setLoading(-1)
      return;
    }

    addToast("Staking success!", {
      appearance: 'success',
      autoDismiss: true,
    })
  }

  const clickCancel = () => {
    setOpenExplore(false)
  }

  useEffect(() => {
    setDrakes([]);
    if (walletState.connected) {
      setLoading(0);
      const pubKey = walletState.publicKey?.toString() || '';
      solanaClient.getAllCollectibles([pubKey]).then(result => {
        let walletDrakes: any[] = [];
        
        if (result[pubKey]) {
          console.log('result', result[pubKey])
          result[pubKey].forEach((res: any) => {
            if (res.creators.find((creator: any) => creator.address === CREATOR_ADDRESS &&
              res.attributes.length > 2 && (res.attributes[0]?.value === 'teenage' || res.attributes[0]?.value === 'king') &&
              res.name.indexOf('InfinityDrakes') >= 0)) {
                walletDrakes.push(res);
              }
          })
          setDrakes(walletDrakes.map(drake => {
            return {
              ...drake,
              size: drake.attributes[0]?.value
            }
          }));
        }
        setLoading(-1);
      });
      if (walletState.publicKey) {
        getTokenAccountByOwner(walletState.publicKey?.toString(), FIRE_TOKEN_MINT).then(result => {
          if (result.result) {
            const { value } = result.result;
            if (value.length > 0) {
              let total_fire = 0;
              value.forEach((v: any) => {
                total_fire += v.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
              })
              setFireCount(total_fire);
            }
          }
        })
      }
    }
  }, [walletState.connected]);
  
  return (
    <div className="div">
      {
        loading >= 0 ?
          <div id="preloader"> 
            { loading === 1 && <div style={{paddingTop: '150px', fontSize: '50px'}}>Staking...</div>}
          </div> :
          <div id="preloader" style={{display: 'none'}}></div>
      }
      <div className="home">
          <Header />
          <div className="status">
              <div>
                  <div className="font_52">
                      InfinityExploration
                  </div>
                  <div className="btn_group"> 
                      <WalletMultiButton className='wallet-btn'/>
                      {/* { walletState.connected &&
                          <Button value="SELECT ALL" style={{ width: 169, height: 50, marginLeft: 28 }} onClick={selectAll} dark />
                      } */}
                  </div>
              </div>
              <div className="total">
                  <div className="font_24">
                      TOTAL <br /> $FIRE
                  </div>
                  <div className="font_52">
                      {fireCount}
                  </div>
              </div>
          </div>
          <div className="eggs">
              {drakes.map((drake, index) => (
                  <EggBox img={drake.imageUrl} key={drake.mint} onClick={selectEgg} id={index} value={"SELECT"}/>
              ))}
          </div>
      </div>
      {openExplore && <ExploreModal
          lockingPeriod={lockingPeriod}
          clickSend={clickSend}
          clickCancel={clickCancel}
          type={drakes[currentDrake].size}
      />}
      <Footer />
    </div>
  )
}

export default HomePage;
