import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, BACKEND_SIGN_IN, extractIdFromUrl, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Loader} from "../components/Loader";
import {inject} from "../utils/InjectHelper";

// @ts-ignore
import stylesheet from "./SalaryPill.scss";

export const SalaryPillFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const profileActions = document.getElementsByClassName('pv-top-card-v2-ctas');
        if (profileActions && profileActions.length > 0) {
            const actions = profileActions[0].getElementsByClassName("pvs-profile-actions");
            if (actions && actions.length > 0) {
                inject(actions[0], "lnm-salary", "after",
                    <SalaryPill/>
                );
            }
        }
    }
    // people's search
    if (window.location.href.indexOf("search/results/people/") > 0) {
        const profileCards = document.querySelectorAll('[data-chameleon-result-urn*="urn:li:member:"]');
        if (profileCards.length > 0) {
            profileCards.forEach(card => {
                const profileLink = card.querySelectorAll('a[href*="/in/"]');
                if (profileLink.length > 0) {
                    const link = profileLink[0].getAttribute("href");
                    const profileActions = card.getElementsByClassName('entity-result__actions');
                    if (profileActions.length > 0) {
                        const lastChild = profileActions[0].childNodes[profileActions[0].childNodes.length - 1];
                        const id = extractIdFromUrl(link);
                        inject(lastChild, `lnm-salary-${id}`, "before",
                            <SalaryPill url={link}/>);
                    }
                }
            })
        }
    }
}

type Props = {
    url?: string
};

export const SalaryPill: React.FC<Props> = ({url}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [salary, setSalary] = useState({result: {formattedPay: "", note: ""}} as any);
    const [completed, setCompleted] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [urlInternal, setUrlInternal] = useState(url);

    useEffect(() => {
        if (disabled) {
            setSalary({result: {formattedPay: "Sign in", note: "Please, sign in to use premium features"}});
            return;
        }
    }, [disabled]);

    useEffect(() => {
        if (!urlInternal) {
            return;
        }
        setCompleted(false);
        messages.request<IAppRequest, any>({
            type: AppMessageType.SalaryPill,
            payload: extractIdFromUrl(urlInternal)
        }, (r) => {
            setCompleted(true);
            if (r.error) {
                setSalary({result: {formattedPay: "N/A", note: r.error}});
                setDisabled(r.status == 403)
            } else {
                setSalary(r);
            }
        }).then(/* nada */);
    }, [urlInternal]);

    useEffect(() => {
        if (!url) {
            setUrlInternal(window.location.href);
            window.addEventListener('hashchange', () => {
                setUrlInternal(window.location.href);
            });
        }
    }, []);

    const onClick = () => {
        if (disabled) {
            return messages.request<IAppRequest, any>({type: AppMessageType.OpenURL, payload: {url: BACKEND_SIGN_IN}});
        }
    }

    const getSalaryValue = () => {
        if (salary.result.progressivePay) {
            return salary.result.progressivePay;
        } else {
            return salary.result.formattedPay;
        }
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className={"salary-pill" + (disabled ? " disabled" : "")} onClick={onClick}
                 title={salary.result.note}>
                <Loader show={!completed}/>
                {completed && getSalaryValue()}
            </div>
        </React.Fragment>
    );
};