import React, { useState, useEffect } from "react";
import { useStardiscRegistryByAccount } from '../../../lib/api'
import {useAccount, useConnectors} from '@starknet-react/core'
import { useTranslation } from "react-i18next";
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Modal from "../ui_common/Modal";
import { number } from "starknet"
import styles from './ConnectWallet.module.css'
import { Provider, Contract, Account, ec, json } from "starknet";

// export default function ConnectWallet ({ modalOpen, handleOnOpen, handleOnClose }) {
export default function ConnectWallet () {
    const { t } = useTranslation();

    // const [open, setOpen] = useState<boolean>(false);
    // const handleOpen = () => {setOpen(true);};
    // const handleClose = () => {setOpen(false);};

    const { available, connect, disconnect } = useConnectors()
    const [connectors, setConnectors] = useState([])
    const [walletNotFound, setWalletNotFound] = useState(false)

    const { account, address, status } = useAccount()
    const account_str_decimal = number.toBN(address).toString(10)
    const { data: stardisc_query } = useStardiscRegistryByAccount (account_str_decimal) // must be a better way than fetching the entire registry

    let modalRender;

    // Connectors are not available server-side therefore we
    // set the state in a useEffect hook
    useEffect(() => {
        if (available) setConnectors(available)
    }, [available])

    const makeshift_button_style = {marginLeft:'0.2rem', marginRight:'0.2rem', height:'1.5rem'}

    const BUTTON_STYLE = {
        height: '1.5rem',
        width: 'auto',
        cursor: 'pointer',
        fontSize : '12px',
        borderRadius : '3px',
        border: '1px solid #000',
        marginRight: '10px'
    }
    if (account) {
        if (!stardisc_query) return;

        let rendered_account
        if (stardisc_query.stardisc_query.length > 0) { // query succeeded, render the handle
            const name = number.toBN(stardisc_query.stardisc_query[0].name).toString(10)
            const name_string = feltLiteralToString (name)
            rendered_account = <p className='result'>{t("Connected")}<strong>{name_string}</strong></p>
        }
        else { // query failed; render address abbreviation
            rendered_account = <p  className='result'>{t("Connected")}{String(address).slice(0,6) + '...' + String(address).slice(-4)}</p>
        }

        modalRender = (
            <div className={styles.wrapper} style={{paddingTop:'1rem'}}>

                {rendered_account}

                <MenuItem
                    // className='creamy-button'
                    // style={BUTTON_STYLE}
                    sx={{width:'100%', mt:2, justifyContent: 'center', color: "black"}}
                    onClick={() => disconnect()}
                >
                    Disconnect
                </MenuItem>
            </div>
        )
    }
    else {
        const menu_items_sorted = [].concat(connectors)
        .sort ((a,b) => {
            if(a.name() < b.name()) { return -1; }
            if(a.name() > b.name()) { return 1; }
            return 0;
        })
        .map ((connector) => (
            <MenuItem
                key={connector.id()}
                onClick={() => connect(connector)}
                sx={{justifyContent: 'center'}}
            >
                {/* {t("Connect")}{connector.name()} */}
                {connector.name()}
            </MenuItem>
        ))

        modalRender = (
            <MenuList>

                {connectors.length > 0 ? menu_items_sorted : (
                    <>
                        <button onClick={() => setWalletNotFound(true)}>Connect</button>
                        {walletNotFound && <p className='error-text'>Wallet not found. Please install ArgentX or Braavos.</p>}
                    </>
                )}

            </MenuList>
        )
    }

    return modalRender
};


// reference: https://stackoverflow.com/a/66228871
function feltLiteralToString (felt: string) {

    const tester = felt.split('');

    let currentChar = '';
    let result = "";
    const minVal = 25;
    const maxval = 255;

    for (let i = 0; i < tester.length; i++) {
        currentChar += tester[i];
        if (parseInt(currentChar) > minVal) {
            // console.log(currentChar, String.fromCharCode(currentChar));
            result += String.fromCharCode( parseInt(currentChar) );
            currentChar = "";
        }
        if (parseInt(currentChar) > maxval) {
            currentChar = '';
        }
    }

    return result
}

