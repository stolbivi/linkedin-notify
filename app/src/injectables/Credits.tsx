import React from "react";
import "./Credits.scss"
import {Logo} from "../icons/Logo";

type Props = {
    short?: boolean
    fromListView?: boolean
};

export const Credits: React.FC<Props> = ({short, fromListView}) => {

    return (
        <div className={`credits ${fromListView?"credits-listview":""}`}>
            <Logo/>
            <span className={short ? "short" : ""}>Powered by LinkedIn Manager Chrome Extension</span>
        </div>
    );

};