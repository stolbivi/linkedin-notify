import React, {useEffect, useState} from "react";
import {Loader} from "./Loader";
import "./AccountDetails.scss";
import {BackendAPI} from "../services/BackendAPI";

type Props = {};

export const AccountDetails: React.FC<Props> = ({}) => {

    const [user, setUser] = useState<string>();
    const [plan, setPlan] = useState<string>();
    const [expiration, setExpiration] = useState<string>();
    const [complete, setComplete] = useState<boolean>();

    const backEnd = new BackendAPI();

    useEffect(() => {
        backEnd.getBilling()
            .then(billing => {
                if (billing.error) {
                    console.error(billing.error);
                } else {
                    setUser(`${billing.response?.user?.firstName} ${billing.response?.user?.lastName}`);
                    setPlan(billing.response.plan);
                    setExpiration(billing.response.expiration.toLocaleDateString());
                    setComplete(true);
                }
            })
    }, []);

    return (
        <div className="account-details">
            {!complete ? <Loader/>
                : <React.Fragment>
                    <h1 className="margin-bottom margin-xsmall">Account Details</h1>
                    <p className="margin-bottom margin-medium">Hi {user}</p>
                    <p className="margin-bottom margin-medium">You are currently on the {plan} plan. Trial active
                        until {expiration}</p>
                    <p className="margin-bottom margin-medium">To access your subscription, click
                        on the &quot;Download&quot; button and add Linkedin Manager to your browser. Our assistant AI
                        comes alive as soon as you browse Linkedin!</p>
                    <p className="margin-bottom margin-medium">Update your billing details or cancel anytime by clicking
                        on &quot;Manage Billing&quot;.</p>
                    <div className="w-row">
                        <div className="column w-col w-col-6">
                            <a href="https://chrome.google.com/webstore/detail/linkedin-manager/bhkcnaoddagihkgnjfmpohdmffbieijb"
                               target="_blank" className="button tertriary w-button">Download Linkedin Manager</a>
                        </div>
                        <div className="w-col w-col-6">
                            <a href="#" className="button-2 w-button">Manage Billing</a>
                        </div>
                    </div>
                </React.Fragment>
            }
        </div>
    );
};