import React, {useEffect, useState} from "react";
import {Loader} from "./Loader";
import {BackendAPI} from "../services/BackendAPI";
import {LOGIN_URL, STRIPE_PUBLIC_KEY} from "../global";

import "./GetStarted.scss";

type Props = {
    checkout?: boolean
};

enum State {
    Store,
    Checkout,
    Dashboard,
    SignIn
}

export const GetStarted: React.FC<Props> = ({checkout}) => {

    const STORE_LINK = "https://chrome.google.com/webstore/detail/linkedin-manager/bhkcnaoddagihkgnjfmpohdmffbieijb";
    const DASHBOARD_LINK = "/dashboard.html";

    const [complete, setComplete] = useState<boolean>(checkout);
    const [state, setState] = useState<State>(State.Store);

    const backEnd = new BackendAPI();
    //@ts-ignore
    const stripe = Stripe(STRIPE_PUBLIC_KEY);

    useEffect(() => {
        setComplete(false);
        backEnd.getSubscription()
            .then(subscriptions => {
                if (subscriptions.status === 403) {
                    if (checkout) {
                        setState(State.SignIn);
                    } else {
                        setState(State.Store);
                    }
                } else {
                    if (subscriptions.response?.subscriptions?.length > 0) {
                        setState(State.Dashboard);
                    } else {
                        setState(State.Checkout);
                    }
                }
            })
            .finally(() => setComplete(true))
    }, []);

    const onCheckout = () => {
        setComplete(false);
        backEnd.checkout()
            .then((session: any) => {
                if (session.error) {
                    console.error(session.error);
                } else {
                    stripe.redirectToCheckout({sessionId: session.response.session.id});
                }
            })
            .finally(() => setComplete(true))
    }

    const getContent = () => {
        if (!complete) {
            return <Loader/>
        }
        switch (state) {
            case State.SignIn:
                return <div className="pricing-1-button-wrap">
                    <a href={LOGIN_URL} className="button w-button">Get started</a>
                </div>
            case State.Store:
                return <div className="pricing-1-button-wrap">
                    <a href={STORE_LINK} className="button w-button">Get started</a>
                </div>
            case State.Dashboard:
                return <div className="pricing-1-button-wrap">
                    <a href={DASHBOARD_LINK} className="button w-button">Get started</a>
                </div>
            case State.Checkout:
                if (checkout) {
                    return <div className="pricing-1-button-wrap" onClick={onCheckout}>
                        <div className="button w-button">Get started</div>
                    </div>
                } else {
                    return <div className="pricing-1-button-wrap">
                        <a href={STORE_LINK} className="button w-button">Get started</a>
                    </div>
                }
        }
    }

    return (
        <React.Fragment>
            {getContent()}
        </React.Fragment>
    );
};