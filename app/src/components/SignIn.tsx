import React from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, DOMAIN, IAppRequest, MESSAGE_ID} from "../global";

type Props = {};

export const SignIn: React.FC<Props> = ({}) => {

    const messages = new Messages();

    const signIn = () => {
        return messages.runtimeMessage<IAppRequest, any>(MESSAGE_ID,
            {type: AppMessageType.OpenURL, payload: {url: "https://" + DOMAIN}});
    }

    return (
        <div className="w-100 d-flex p-5 justify-content-center align-items-center">
            <div className="sign-in" onClick={signIn}>Sign in</div>
        </div>
    );
};