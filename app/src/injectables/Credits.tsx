import React from "react";
import "./Credits.scss"
import {Logo} from "../icons/Logo";

type Props = {
    short?: boolean
};

export const Credits: React.FC<Props> = ({short}) => {

    return (
        <div className="credits">
            <Logo/>
            <span className={short ? "short" : ""}>Powered by LinkedIn Manager Chrome Extension</span>
        </div>
    );

};