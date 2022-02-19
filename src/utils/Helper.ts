import { useState, useEffect } from 'react'
import * as anchor from '@project-serum/anchor';
import CONFIG from '../config';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
const { COMMITMENT } = CONFIG;

export const getImg = (img: string) => {
    if (img === undefined)
        return  null;
    return require(`../assets/${img}`).default
}

export const useResize = () => {
    const [screenSize, setScreenSize] = useState({
        width: 0,
        height: 0,
        isMobile: false,
        isResponsive: false
    })

    const updateSize = () => {
        setScreenSize({
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: window.innerWidth < 768,
            isResponsive: window.innerWidth < 1320
        })
    }

    useEffect(() => {
        window.addEventListener("resize", updateSize)
        updateSize()

        return () => {
            window.removeEventListener("resize", updateSize)
        }
    }, [])

    return screenSize;
}

export const useDetectOutsideClick = (el: any, initialState: any) => {
    const [isActive, setIsActive] = useState(initialState);

    useEffect(() => {
        const onClick = (e: any) => {
            if (el.current !== null && !el.current.contains(e.target)) {
                setIsActive(!isActive);
            }
        };

        if (isActive) {
            window.addEventListener("click", onClick);
        }

        return () => {
            window.removeEventListener("click", onClick);
        };
    }, [isActive, el]);

    return [isActive, setIsActive];
};

export const getEnglishNumber = (num: number) => {
    return num.toLocaleString();
}

export const numberToFixed = (num: number, fixed: number) => {
    return Number(Number(num).toFixed(fixed));
}

export const getProvider = (connection: anchor.web3.Connection, wallet: AnchorWallet ) => {
    if (wallet)
        return new anchor.Provider(connection, wallet, COMMITMENT as anchor.web3.ConfirmOptions);
}

export const makeATokenAccountTransaction = async (connection: anchor.web3.Connection, wallet: anchor.web3.PublicKey, owner: anchor.web3.PublicKey, mint: anchor.web3.PublicKey) => {
    const { SystemProgram, Keypair } = anchor.web3;
    const instructions = [], signers = [];
    const aTokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, { mint: mint });
    const rent = await connection.getMinimumBalanceForRentExemption(
        AccountLayout.span
    )
    let tokenTo;
    if (aTokenAccounts.value.length === 0) {
      const aTokenAccount = new Keypair();
      instructions.push(SystemProgram.createAccount({
        fromPubkey: wallet,
        newAccountPubkey: aTokenAccount.publicKey,
        lamports: rent,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID
      }));
      instructions.push(Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        mint,
        aTokenAccount.publicKey,
        owner
      ));
      signers.push(aTokenAccount);
      tokenTo = aTokenAccount.publicKey;
    }
    else {
      tokenTo = aTokenAccounts.value[0].pubkey;
    }

    return { instructions, signers, tokenTo }
}

export const getCurrentChainTime = async (connection: anchor.web3.Connection) => {
    const slot = await connection.getSlot(COMMITMENT);
    const curChainTime = await connection.getBlockTime(slot);
    return curChainTime;
}