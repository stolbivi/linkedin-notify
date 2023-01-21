import React from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, LINKEDIN_DOMAIN, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";

type Props = {};

export const SignIn: React.FC<Props> = ({}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const signIn = () => {
        return messages.request<IAppRequest, any>({type: AppMessageType.OpenURL, payload: {url: "https://" + LINKEDIN_DOMAIN}});
    }

    return (
        <div className="w-100 d-flex p-5 justify-content-center align-items-center">
            <div className="sign-in" onClick={signIn}>Sign in</div>
        </div>
    );
};