import React, {useEffect, useState} from "react";
import {Loader} from "./Loader";
import "./AccountDetails.scss";
import {BackendAPI} from "../services/BackendAPI";
import {LOGIN_URL, Subscription} from "../global";
import {Logo} from "./Logo";

type Props = {};

export const AccountDetails: React.FC<Props> = ({}) => {

    const [user, setUser] = useState<string>();
    const [subscriptionDetails, setSubscriptionDetails] = useState<string>();
    const [billingUrl, setBillingUrl] = useState<string>();
    const [complete, setComplete] = useState<boolean>();
    const [error, setError] = useState<string>();
    const [login, setLogin] = useState<boolean>();

    const backEnd = new BackendAPI();

    const getSubscriptionDetails = (subscriptions: Subscription[]) => {
        function formatDate(value: number) {
            return new Date(value * 1000).toLocaleString()
        }

        const subscription = subscriptions[0];
        const planDetails = `You are currently in ${subscription.name} plan.`;
        const expirationDetails = subscription.status === "trialing"
            ? `Trial active until ${formatDate(subscription.trialEnd)}`
            : `Current billing period end on ${formatDate(subscription.trialEnd)}`;
        return `${planDetails} ${expirationDetails}`;
    }

    useEffect(() => {
        setComplete(false);
        backEnd.getSubscription()
            .then(subscription => {
                if (subscription.status === 403 || !(subscription.response?.subscriptions?.length > 0)) {
                    setLogin(true);
                    setComplete(true)
                    return;
                }
                if (subscription.error) {
                    console.error(subscription.error);
                    setError(subscription.error);
                    setComplete(true)
                } else {
                    setUser(`${subscription.response?.user?.firstName} ${subscription.response?.user?.lastName}`);
                    setSubscriptionDetails(getSubscriptionDetails(subscription.response.subscriptions));
                    backEnd.getBilling()
                        .then(billing => {
                            setBillingUrl(billing.response.session.url);
                        })
                        .finally(() => setComplete(true));
                }
            });
    }, []);

    const getContent = () => {
        if (!complete) {
            return <Loader/>;
        }
        if (!(error == undefined)) {
            return <React.Fragment><p className="margin-bottom margin-medium">Oops. Something went wrong. Please, try
                again later</p></React.Fragment>
        }
        if (login) {
            return <React.Fragment>
                <a href={LOGIN_URL}>
                    <div className="sign-in">
                        <Logo/>
                        <span>Sign in with LinkedIn</span>
                    </div>
                </a>
            </React.Fragment>
        }
        return <React.Fragment>
            <h1 className="margin-bottom margin-xsmall text-align-center">Account Details</h1>
            <p className="margin-bottom margin-medium text-align-center">Hi {user}</p>
            <p className="margin-bottom margin-medium text-align-center">{subscriptionDetails}</p>
            <p className="margin-bottom margin-medium text-align-center">To access your subscription, click
                on the &quot;Download&quot; button and add Linkedin Manager to your browser. Our assistant AI
                comes alive as soon as you browse Linkedin!</p>
            <p className="margin-bottom margin-medium text-align-center">Update your billing details or cancel anytime
                by clicking on &quot;Manage Billing&quot;.</p>
            <div className="w-row">
                <div className="column w-col w-col-6">
                    <a href="https://chrome.google.com/webstore/detail/linkedin-manager/bhkcnaoddagihkgnjfmpohdmffbieijb"
                       target="_blank" className="button tertriary w-button details-button">Download LinkedIn
                        Manager</a>
                </div>
                <div className="w-col w-col-6">
                    <a href={billingUrl} className="button-2 w-button details-button">Manage Billing</a>
                </div>
            </div>
        </React.Fragment>
    }

    return (
        <div className="account-details">
            {getContent()}
        </div>
    );
};