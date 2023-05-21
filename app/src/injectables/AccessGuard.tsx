import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {LOGIN_URL, VERBOSE} from "../global";
import {Lock} from "../icons/Lock";
import {Loader} from "../components/Loader";
import "./AccessGuard.scss";
import {getBilling, getSubscription, openUrl as openUrlAction} from "../actions";
import {AccessService} from "../services/AccessService";

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

    const messages = new MessagesV2(VERBOSE);
    const accessService = new AccessService();

    const [completed, setCompleted] = useState<boolean>(false);
    const [state, setState] = useState<AccessState>(AccessState.Unknown);
    const [status, setStatus] = useState("Upgrade To Pro");
    const [redirectUrl, setRedirectUrl] = useState(SIGN_UP_URL);

    useEffect(() => {
        messages.request(getSubscription())
            .then((r) => {
                return accessService.handleSubscription(r,
                    () => {
                        setState(AccessState.Valid);
                        setAccessState(AccessState.Valid);
                    },
                    () => {
                        setState(AccessState.Invalid);
                        setAccessState(AccessState.Invalid);
                    },
                    () => {
                        setStatus("Active Free Trial");
                        setState(AccessState.SignInRequired);
                        setAccessState(AccessState.SignInRequired);
                    });
            }).finally(() => setCompleted(true));
    }, []);

    useEffect(() => {
        if(status === "Active Free Trial") {
            setRedirectUrl(LOGIN_URL)
        } else if(status === "Upgrade To Pro") {
            messages.request(getBilling())
                .then((resp) => {
                    setRedirectUrl(resp?.session?.url);
                });
        }
    },[status])

    const openUrl = (e: any, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        return messages.request(openUrlAction(url));
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
                            onClick={(e) => openUrl(e, redirectUrl)}
                            title="Sign up">
                    <Lock/>
                    {!hideTitle && <span>{status}</span>}
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