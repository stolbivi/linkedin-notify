import React from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {LINKEDIN_DOMAIN, VERBOSE} from "../global";
import "./SignIn.scss";
import {openUrl} from "../actions";

type Props = {};

export const SignIn: React.FC<Props> = ({}) => {

    const messages = new MessagesV2(VERBOSE);

    const signIn = () => {
        return messages.request(openUrl("https://" + LINKEDIN_DOMAIN));
    }

    return (
        <div className="w-100 d-flex p-5 justify-content-center align-items-center">
            <div className="sign-in" onClick={signIn}>Sign in</div>
        </div>
    );
};