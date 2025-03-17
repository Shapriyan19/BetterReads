import React from "react";
import "./BetterReadsWord.css";
import logo from "../assets/BetterReadsWord.png";

const Logo = () => {
    return(
        <div className="logo-container">
            <img src={logo} alt="Better Reads Word" className="brword" />
        </div>
    );
};

export default Logo;