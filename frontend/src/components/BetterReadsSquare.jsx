import React from "react";
import "./BetterReadsSquare.css";
import logoS from "../assets/BetterReadsSquare.png";

const LogoS = () => {
    return(
        <div className="logo-container">
            <img src={logoS} alt="Better Reads Square" className="brsquare" />
        </div>
    );
};

export default LogoS;