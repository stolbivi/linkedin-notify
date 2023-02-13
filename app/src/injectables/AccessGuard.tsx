import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Lock} from "../icons/Lock";
import {Loader} from "../components/Loader";

import "./AccessGuard.scss";

export const SIGN_IN_URL = `${process.env.BACKEND_BASE}/auth/linkedin`;
export const SIGN_UP_URL = `${process.env.SIGN_UP_URL}`;

export enum AccessState {
    Unknown,
    Valid,
    Invalid,
    SignInRequired
}

type Props = {
    setAccessState: (accessState: AccessState) => void;
    className?: string
    loaderClassName?: string
    hideTitle?: boolean
};

export const AccessGuard: React.FC<Props> = ({className, loaderClassName, setAccessState, hideTitle}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);
    const [completed, setCompleted] = useState<boolean>(false);
    const [state, setState] = useState<AccessState>(AccessState.Unknown);

    useEffect(() => {
        messages.request<IAppRequest, any>({
            type: AppMessageType.Subscription,
        }, (r) => {
            if (r.status === 403) {
                setState(AccessState.SignInRequired);
                setAccessState(AccessState.SignInRequired);
            } else if (r.subscriptions?.length > 0) {
                const subscription = r.subscriptions[0];
                if (subscription.status === "trialing" || subscription.status === "active") {
                    setState(AccessState.Valid);
                    setAccessState(AccessState.Valid);
                    return;
                }
            }
            setState(AccessState.Invalid);
            setAccessState(AccessState.Invalid);
        }).finally(() => setCompleted(true));
    }, []);

    const openUrl = (e: any, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        return messages.request<IAppRequest, any>({
            type: AppMessageType.OpenURL,
            payload: {url}
        });
    }

    const getContents = () => {
        switch (state) {
            case AccessState.SignInRequired:
                return <div className={"access-guard " + (className ?? "")}
                            onClick={(e) => openUrl(e, SIGN_IN_URL)}
                            title="Sign in">
                    <Lock/>
                    {!hideTitle && <span>Sign in</span>}
                </div>
            case AccessState.Invalid:
                return <div className={"access-guard " + (className ?? "")}
                            onClick={(e) => openUrl(e, SIGN_UP_URL)}
                            title="Sign up">
                    <Lock/>
                    {!hideTitle && <span>Upgrade to Pro</span>}
                </div>
        }
    }

    return (
        <React.Fragment>
            <Loader show={!completed} className={loaderClassName}/>
            {state !== AccessState.Valid && getContents()}
        </React.Fragment>
    )

}