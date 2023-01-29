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

export interface Salary {
    urn?: string
    title?: string
    symbol?: string
    formattedPay?: string
    formattedPayValue?: string
    progressivePay?: string
    progressivePayValue?: string
    note?: string
    payDistribution?: string[]
    payDistributionValues?: number[]
    payPeriodAnnual?: string[]
}

export const getSalaryValue = (salary: Salary) => {
    if (salary.progressivePay) {
        return salary.progressivePay;
    } else {
        return salary.formattedPay;
    }
}

export const SalaryPill: React.FC<Props> = ({url}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [salary, setSalary] = useState<Salary>({formattedPay: "", note: ""});
    const [completed, setCompleted] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [urlInternal, setUrlInternal] = useState<string>(url);

    useEffect(() => {
        if (disabled) {
            setSalary({formattedPay: "Sign in", note: "Please, sign in to use premium features"});
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
            if (r.error) {
                setSalary({formattedPay: "N/A", note: r.error});
                setDisabled(r.status == 403)
            } else {
                setSalary({...r.result, title: r.title, urn: r.urn});
            }
            setCompleted(true);
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
        } else {
            if (salary) {
                return messages.request({
                    type: AppMessageType.NotesAndCharts,
                    payload: {salary}
                });
            }
        }
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className={"salary-pill" + (disabled ? " disabled" : "") + (completed ? " clickable" : "")}
                 onClick={onClick}
                 title={salary.note}>
                <Loader show={!completed}/>
                {completed && getSalaryValue(salary)}
            </div>
        </React.Fragment>
    );
};