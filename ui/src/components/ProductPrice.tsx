import React, {useEffect, useState} from "react";
import {Loader} from "./Loader";
import {BackendAPI} from "../services/BackendAPI";
import {LOGIN_URL, Price, STRIPE_PUBLIC_KEY} from "../global";

import "./ProductPrice.scss";

type Props = {
    checkout?: boolean
};

export const ProductPrice: React.FC<Props> = ({checkout}) => {

    const STORE_LINK = "https://chrome.google.com/webstore/detail/linkedin-manager/bhkcnaoddagihkgnjfmpohdmffbieijb";
    const DASHBOARD_LINK = "/dashboard.html";

    const [complete, setComplete] = useState<boolean>(!checkout);
    const [hasSubscription, setHasSubscription] = useState<boolean>();
    const [price, setPrice] = useState<Price>();

    const backEnd = new BackendAPI();

    const onCheckout = (price?: string) => {
        setComplete(false);
        backEnd.checkout(price)
            .then((session: any) => {
                if (session.status === 403) {
                    window.location.href = LOGIN_URL;
                }
                if (session.error) {
                    console.error(session.error);
                } else {
                    //@ts-ignore
                    const stripe = Stripe(STRIPE_PUBLIC_KEY);
                    stripe.redirectToCheckout({sessionId: session.response.session.id});
                }
            })
            .finally(() => setComplete(true))
    }

    useEffect(() => {
        if (checkout) {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get("checkout") === "1") {
                onCheckout();
            } else {
                setComplete(false);
                backEnd.getPrice()
                    .then(response => {
                        setPrice(response.response.price);
                        setHasSubscription(response.response.hasSubscription);
                    })
                    .finally(() => setComplete(true))
            }
        }
    }, []);

    const getPrice = () => {
        if (price) {
            return `${price.symbol}${price.amount} ${price.currency.toUpperCase()}`
        } else {
            if (checkout) {
                return "";
            }
        }
        return "FREE";
    }

    const getButton = () => {
        if (checkout) {
            if (hasSubscription) {
                return <div className="pricing-1-button-wrap">
                    <a href={DASHBOARD_LINK} className="button w-button">Get started</a>
                </div>
            } else if (price) {
                return <div className="pricing-1-button-wrap" onClick={() => onCheckout(price.id)}>
                    <div className="button w-button">Get started</div>
                </div>
            }
        } else {
            return <div className="pricing-1-button-wrap">
                <a href={STORE_LINK} className="button w-button">Get started</a>
            </div>
        }
    }

    return (
        <React.Fragment>
            {!complete && <div className="loader-container"><Loader/></div>}
            {complete && <React.Fragment>
                <div className="margin-bottom margin-xtiny">
                    <p className="text-align-center heading-large">{getPrice()}</p>
                </div>
                <p className="text-align-center">Monthly</p>
                {getButton()}
            </React.Fragment>}
        </React.Fragment>
    );
};