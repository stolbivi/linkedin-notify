import React from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import "./Premium.scss"

type Props = {
    setUnlocked: (unlocked: boolean) => void
};

export const Premium: React.FC<Props> = ({setUnlocked}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const unlock = () => messages.request<IAppRequest, boolean>({type: AppMessageType.Unlock}).then(_ => {
        setUnlocked(true);
    });

    return (
        <div className="premium">
            <div className="back-drop"></div>
            <div className="premium-message">
                <div className="text-center">Enable this premium feature for FREE by sharing our extension with your
                    network!
                </div>
                <div className="premium-share" onClick={unlock}>Share on LinkedIn</div>
            </div>
        </div>
    );
};