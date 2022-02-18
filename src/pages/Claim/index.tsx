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
} from '@solana/web3.js';
import { useToasts } from 'react-toast-notifications'
import { AccountLayout, Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";

import Button from "../../components/Button/index";
import Header from "../../components/Header";
import Footer from '../../components/Footer';
import EggBox from "../../components/EggBox";
import { SolanaClient, SolanaClientProps } from '../../helpers/sol';
import { 
  CREATOR_ADDRESS,
  COMMITMENT,
  CLUSTER_API, 
  PROGRAM_ID,
  FIRE_TOKEN_VAULT,
  FIRE_TOKEN_MINT
} from '../../config/main.js';
import { IDL } from '../../constants/idl'
import './index.css';
import { 
  getAccountInfo, 
  getBlockTime, 
  getRecentBlockHash, 
  getTokenAccountByOwner 
} from '../../api/api';
import { sendTransactions } from '../../helpers/sol/connection';

function ClaimPage() {
  const walletState = useWallet();
  const wallet = useAnchorWallet();
  const [drakes, setDrakes] = useState([
    {
      imageUrl: '',
      size: '',
      mint: '',
      tokenAccount: '',
      name: '',
      amount: 0,
      isStakeFinished: false,
    },
  ])
  const [loading, setLoading] = useState(-1);
  const { connection } = useConnection();
  const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API } as SolanaClientProps);
  const { addToast } = useToasts()
  const [fireCount, setFireCount] = useState(0)
  let intervalId: any = -1;

  const claim = async (id: any) => {
    try {
      console.log('id', id);
      setLoading(1);
      if (!walletState.publicKey) {
        addToast("Connect your wallet!", {
          appearance: 'warning',
          autoDismiss: true,
        })
        return;
      }
      const provider = getProvider();
      const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
      let [pool, _nonce] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('pool1'), walletState.publicKey.toBuffer()],
        program.programId
      );
      let [poolSigner, _nonceSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('pool1 signer'), walletState.publicKey.toBuffer()],
          program.programId
      );
  
      let [vault, _vaultSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('infinity-drake-staking vault')],
          program.programId
      );
  
      console.log('pool', pool.toString());
      const { result } = await getAccountInfo(pool.toBase58());
      console.log('result', result);
      console.log('pool signer', poolSigner.toString());
      console.log('vault',vault.toString(), _vaultSigner);
      let instructionSet = [];
      let signerSet = [];
      let transaction = [];
      let signers = [];
      if (result.value) {
        let tokenResult = await getTokenAccountByOwner(walletState.publicKey.toString(), FIRE_TOKEN_MINT);
        if (tokenResult.result.value.err) {
          addToast("Claim Failed!", {
            appearance: 'warning',
            autoDismiss: true,
          })
          setLoading(-1)
          return;
        }
        console.log('token result 2', tokenResult);
        let token_to = '';
        let claimedDrakes: any[] = [];
        let addFireAmount = 0;
        if (tokenResult.result.value.length === 0) {
          const aTokenAccount = new Keypair();
          const aTokenAccountRent = await connection.getMinimumBalanceForRentExemption(
            AccountLayout.span
          )
          transaction.push(SystemProgram.createAccount({
              fromPubkey: walletState.publicKey,
              newAccountPubkey: aTokenAccount.publicKey,
              lamports: aTokenAccountRent,
              space: AccountLayout.span,
              programId: TOKEN_PROGRAM_ID
          }));
          transaction.push(
            Token.createInitAccountInstruction(
              TOKEN_PROGRAM_ID,
              new PublicKey(FIRE_TOKEN_MINT),
              aTokenAccount.publicKey,
              walletState.publicKey
          ));
          signers.push(aTokenAccount);
          instructionSet.push(transaction);
          signerSet.push(signers);
          token_to = aTokenAccount.publicKey.toString();
        }
        else {
          token_to = tokenResult.result.value[0].pubkey;
        }
        const makeTransaction = async (drake: any) => {
          const tempWallet = Keypair.generate();
          const transaction = [];
          let tokenResult = await getTokenAccountByOwner(walletState.publicKey?.toString() || tempWallet.publicKey.toString(), drake.mint);
          const nftTo = tokenResult.result.value[0].pubkey;
          console.log('drakeAccount', drake.tokenAccount);
          transaction.push(
            program.instruction.claimNft(_nonceSigner, _vaultSigner, {
              accounts: {
                pool: pool,
                poolSigner: poolSigner,
                user: walletState.publicKey || tempWallet.publicKey,
                mint: new PublicKey(drake.mint),
                vault: vault,
                nftFrom: new PublicKey(drake.tokenAccount),
                nftTo: new PublicKey(nftTo),
                tokenFrom: new PublicKey(FIRE_TOKEN_VAULT),
                tokenTo: new PublicKey(token_to),
                tokenProgram: TOKEN_PROGRAM_ID
            }
          }));
          return transaction;
        }
        if (id === -1) {
          for (let i = 0; i < drakes.length; i ++) {
            const drake = drakes[i];
            if (drake.isStakeFinished) {
              transaction = await makeTransaction(drake); 
              instructionSet.push(transaction);
              signerSet.push([]);
              claimedDrakes.push(i);
              addFireAmount += drake.amount;
            }
          }
        }
        else {
          const drake = drakes[id];
          transaction = await makeTransaction(drake); 
          instructionSet.push(transaction);
          signerSet.push([]);
          claimedDrakes.push(id);
          addFireAmount += drake.amount;
        }
        await sendTransactions(connection, walletState, instructionSet, signerSet);
        console.log('claimed drakes', claimedDrakes);
        let filteredDrakes = drakes.filter((_drake, idx: number) => claimedDrakes.findIndex(drakeIndex => drakeIndex == idx) < 0);
        console.log('filteredDrakes', filteredDrakes);
        setTimeout(async () => {
          await getFireToken();
        }, 20000);
        setDrakes(filteredDrakes);
        setFireCount(fireCount + addFireAmount);
        
      }
      else {
        addToast("Claim failed!", {
          appearance: 'error',
          autoDismiss: true,
        })
        setLoading(-1)
        return;
      }
      
      const data = await program.account.pool.fetch(pool);
      console.log('pool data', data);
      setLoading(-1)
    }
    catch (error) {
      console.log('error', error);
      addToast("Claim failed!", {
        appearance: 'error',
        autoDismiss: true,
      })
      setLoading(-1)
      return;
    }

    addToast("Claming success!", {
      appearance: 'success',
      autoDismiss: true,
    })
  }


  const getProvider = () => {
    if (wallet)
		  return new anchor.Provider(connection, wallet, COMMITMENT as anchor.web3.ConfirmOptions);
	}

  const checkStaking = async (walletDrakes: any, pool: PublicKey) => {
    try {
      const provider = getProvider();
      const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
      const data = await program.account.pool.fetch(pool);
      console.log('data', data);
      let nfts:any = data.nfts;
      console.log('drakes', drakes);
      console.log('walletdrakes', walletDrakes);
      const blockResult = await getRecentBlockHash();
      const timeResult = await getBlockTime(blockResult?.result?.context?.slot);
      let currentTime = timeResult?.result;
      let currentDrakes = ((drakes.length === 1 && drakes[0].amount === 0)) ? walletDrakes : drakes;
      setDrakes(currentDrakes.map((drake: any) => {
        let amount = 0;
        for (let i = 0; i < nfts.length; i ++) {
          const nft:any = nfts[i];
          console.log('nft', parseInt(nft.amount.toString()));
         
          console.log('currentDate', currentTime, nft.endDate, nft.startDate)
          if (drake.mint === nft.mint.toString()) {
            amount = parseInt(nft.amount.toString());
            if (nft.endDate <= currentTime) {
              return {
                ...drake,
                amount,
                isStakeFinished: true
              }
            }
          }
        }
        return { ...drake, amount, isStakeFinished: false };
      }).filter((drake: any) => drake.amount > 0))
    }
    catch (error) {
      console.log('error', error);
    }
  }

  const checkStakingState = async (walletDrakes: any, pool: PublicKey) => {
    await checkStaking(walletDrakes, pool);
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(async () => {
      await checkStaking(walletDrakes, pool);
    }, 60000)
  }

  const getFireToken = async () => {
    if (walletState.publicKey) {
      const result: any = await getTokenAccountByOwner(walletState.publicKey?.toString(), FIRE_TOKEN_MINT);
      const { value } = result.result;
      console.log('value', value);
      if (value.length > 0) {
        let total_fire = 0;
        value.forEach((v: any) => {
          total_fire += v.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        })
        setFireCount(total_fire);
      }
    }
  }
  
  useEffect(() => {
    (async () => {
      if (walletState.connected) {
        setLoading(0);
        setDrakes([]);
        const provider = getProvider();
		    const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
        if (!walletState.publicKey) {
          return;
        }

        let [pool, _nonce] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from('pool1'), walletState.publicKey.toBuffer()],
          program.programId
        );

        let [pool_signer, _nonce_signer] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from('pool1 signer'), walletState.publicKey.toBuffer()],
          program.programId
        );

        console.log('pool1', pool.toString());
        console.log('pool1 signer', pool_signer.toString())
        let result = await solanaClient.getAllCollectibles([pool_signer.toString()]);
        let walletDrakes: any[] = [];
        if (result[pool_signer.toString()]) {
          console.log('result', result[pool_signer.toString()])
          result[pool_signer.toString()].forEach((res: any) => {
            if (res.creators.find((creator: any) => creator.address === CREATOR_ADDRESS &&
              res.attributes.length > 2 && (res.attributes[0]?.value === 'teenage' || res.attributes[0]?.value === 'king') &&
              res.name.indexOf('InfinityDrakes') >= 0)) {
                walletDrakes.push(res);
              }
          })
          await checkStakingState(walletDrakes, pool);
          await getFireToken();
          setLoading(-1);
        }
      }
    })()
  }, [walletState.connected]);
  
  return (
    <div className="div">
      {
        loading >= 0 ?
          <div id="preloader"> 
            { loading === 1 && <div style={{paddingTop: '150px', fontSize: '50px'}}>Claiming...</div>}
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
                      { walletState.connected &&
                          <Button value="CLAIM ALL" style={{ width: 169, height: 50, marginLeft: 28 }} onClick={() => claim(-1)} dark />
                      }
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
              drake.amount > 0 ?
                <EggBox 
                img={drake.imageUrl} 
                key={drake.mint}
                onClick={() => claim(index)} 
                id={index} 
                lockable={true}
                locked={!drake.isStakeFinished}
                value={"CLAIM"}
                amount={drake.amount}
                /> : ''
            ))}
          </div>
      </div>
      <Footer />
    </div>
  )
}

export default ClaimPage;