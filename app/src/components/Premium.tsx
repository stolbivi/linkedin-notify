import React from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../global";
import "./Premium.scss"
import {unlock} from "../actions";

type Props = {
    setUnlocked: (unlocked: boolean) => void
};

export const Premium: React.FC<Props> = ({setUnlocked}) => {

    const messages = new MessagesV2(VERBOSE);

    const onClick = () => messages.request(unlock()).then(_ => setUnlocked(true));

    return (
        <div className="premium">
            <div className="back-drop"></div>
            <div className="premium-message">
                <div className="text-center">Enable this premium feature for FREE by sharing our extension with your
                    network!
                </div>
                <div className="premium-share" onClick={onClick}>Click Here</div>
            </div>
        </div>
    );
};