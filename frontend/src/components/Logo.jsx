import React from "react";
import "./Logo.css";
import logo from "C:/Users/mani7/Desktop/NTU CEG/Y2S2/SC2006/Logo.png";

const Logo = () => {
    return(
        <div className="logo-container">
            <img src={logo} alt="Logo" className={Logo} />
        </div>
    );
};

export default Logo;