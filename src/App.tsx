import './App.css';
import './styles/global.css';
import './styles/fonts.css';
import './styles/app.css';

import React, { useState, useEffect, useMemo, useRef, useContext, useReducer } from "react";
import Modal  from 'react-modal';
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

import { getPhantomWallet, getSolflareWallet } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from "@solana/web3.js";
import { ToastProvider } from 'react-toast-notifications'

import ClaimPage from './pages/ClaimPage';
import StakePage from './pages/StakePage';

import { CLUSTER } from './config/main.js'
import { CLUSTER_API } from './config/main';
require('@solana/wallet-adapter-react-ui/styles.css');

Modal.setAppElement('#root');

const AppWithProvider = () => {
  const network = CLUSTER;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [getPhantomWallet(), getSolflareWallet()],
    []
  );
  return (
      <ConnectionProvider endpoint={CLUSTER_API}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ToastProvider autoDismissTimeout={5000}>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<StakePage />} />
                  <Route path="/stake" element={<StakePage />} />
                  <Route path="/claim" element={<ClaimPage />} />
                  <Route path='/*' element={<h2 className="text-center mt-40">Page not found!</h2>}/>
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
  )
}
export default AppWithProvider;