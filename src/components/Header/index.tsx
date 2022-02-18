import React, { useState } from "react";
import { NavLink } from 'react-router-dom'
import { BASIC_URL, DISCORD_URL, TWITTER_URL } from "../../config/dev";

import { getImg } from "../../utils/Helper";
import './index.css';

const Header = () => {
    const [isOpen] = useState(false)

    return (
        <header>
            <div className="header-div">
                <NavLink to="/"><img src={getImg('logo.png')} alt="logo" /></NavLink>
                <div>
                    <NavLink to={`${BASIC_URL}/evolve`}>EVOLVE</NavLink>
                    <NavLink to={`${BASIC_URL}/hatch`}>HATCH</NavLink>
                    <NavLink to="/claim">CLAIM</NavLink>
                    <NavLink to="/">STAKE</NavLink>
                    <a href={`${TWITTER_URL}`} target="_blank" rel="noreferrer"><img src={getImg('twitter.png')} alt="twitter" /></a>
                    <a href={`${DISCORD_URL}`} target="_blank" rel="noreferrer"><img src={getImg('discord.png')} alt="discord" /></a>
                </div>
            </div>
            {isOpen && <div className="menu">
                <div>
                    <div>Disconnect</div>
                </div>
            </div>}
        </header>
    )
}

export default Header