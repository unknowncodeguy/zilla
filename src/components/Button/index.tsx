import React from "react";

import './index.css'

const Button = (props: any) => {
    return (
        <>
            {props.dark && <button
                className="dark"
                style={props.style}
                onClick={props.onClick}>
                {props.value}
                {props.src && <img src={props.src} alt="icon" />}
            </button>}
            {props.light && <button
                className="light"
                style={props.style}
                onClick={props.onClick}>
                {props.value}
            </button>}
        </>
    )
}

export default Button