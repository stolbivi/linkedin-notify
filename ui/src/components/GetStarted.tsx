import React, {useEffect, useState} from "react";
import {Loader} from "./Loader";
import "./AccountDetails.scss";
import {BackendAPI} from "../services/BackendAPI";

type Props = {};

export const GetStarted: React.FC<Props> = ({}) => {

    const STORE_LINK = "https://chrome.google.com/webstore/detail/linkedin-manager/bhkcnaoddagihkgnjfmpohdmffbieijb";
    const [complete, setComplete] = useState<boolean>();
    const [href, setHref] = useState<string>();

    const backEnd = new BackendAPI();

    useEffect(() => {
        setComplete(false);
        backEnd.getBilling()
            .then(billing => {
                if (billing.error) {
                    setHref(STORE_LINK);
                } else {
                    setHref("/dashboard.html");
                }
            })
            .finally(() => setComplete(true))
    }, []);

    const getContent = () => {
        if (!complete) {
            return <Loader/>;
        }
        return <a href={href} className="button w-button">Get started</a>;
    }

    return (
        <div id="get-started-free" className="pricing-1-button-wrap">
            {getContent()}
        </div>
    );
};