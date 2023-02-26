import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, extractIdFromUrl, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Loader} from "../components/Loader";
import {inject} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";

// @ts-ignore
import stylesheet from "./SalaryPill.scss";

export const SalaryPillFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const profileActions = document.getElementsByClassName("pv-top-card-v2-ctas");
        if (profileActions && profileActions.length > 0) {
            const actions = profileActions[0].getElementsByClassName("pvs-profile-actions");
            if (actions && actions.length > 0) {
                inject(actions[0], "lnm-salary", "after",
                    <SalaryPill showSalary={true}/>
                );
            }
        }
    }
    // people's search
    if (window.location.href.toLowerCase().indexOf("search/results/people/") > 0) {
        const profileCards = document.querySelectorAll('[data-chameleon-result-urn*="urn:li:member:"]');
        if (profileCards.length > 0) {
            profileCards.forEach((card, index) => {
                const profileLink = card.querySelectorAll('a[href*="/in/"]');
                if (profileLink.length > 0) {
                    const link = profileLink[0].getAttribute("href");
                    const profileActions = card.getElementsByClassName("entity-result__actions");
                    if (profileActions.length > 0) {
                        const lastChild = profileActions[0].childNodes[profileActions[0].childNodes.length - 1];
                        const id = extractIdFromUrl(link);
                        inject(lastChild, `lnm-salary-${index}`, "before",
                            <SalaryPill url={link} id={id}/>);
                    }
                }
            })
        }
    }
}

type Props = {
    url?: string
    showSalary?: boolean
    showNotes?: boolean
    id?: string
};

export interface Salary {
    urn?: string
    title?: string
    symbol?: string
    formattedPay?: string
    formattedPayValue?: number
    progressivePay?: string
    progressivePayValue?: number
    note?: string
    payDistribution?: string[]
    payDistributionValues?: number[]
    payPeriodAnnual?: string[]
    experienceYears?: number
}

export const getSalaryValue = (salary: Salary) => {
    if (salary.progressivePay) {
        return salary.progressivePay;
    } else {
        return salary.formattedPay;
    }
}

export const SalaryPill: React.FC<Props> = ({url, id, showSalary = false, showNotes = false}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [salary, setSalary] = useState<Salary>({formattedPay: "", note: ""});
    const [completed, setCompleted] = useState<boolean>(false);
    const [urlInternal, setUrlInternal] = useState<string>(url);

    useEffect(() => {
        if (accessState !== AccessState.Valid || !urlInternal) {
            return;
        }
        setCompleted(false);
        messages.request<IAppRequest, any>({
            type: AppMessageType.SalaryPill,
            payload: extractIdFromUrl(urlInternal)
        }, (r) => {
            if (r.error) {
                setSalary({formattedPay: "N/A", note: r.error});
            } else {
                setSalary({...r.result, title: r.title, urn: r.urn});
            }
            setCompleted(true);
        }).then(/* nada */);
    }, [accessState, urlInternal]);

    useEffect(() => {
        if (!url) {
            setUrlInternal(window.location.href);
            window.addEventListener("popstate", () => {
                setUrlInternal(window.location.href);
            });
        }
    }, []);

    const onClick = () => {
        if (salary) {
            return messages.request({
                type: AppMessageType.NotesAndCharts,
                payload: {id, salary, showSalary, showNotes}
            });
        }
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16"}
                         loaderClassName={"loader-base loader-px24"}/>
            {accessState === AccessState.Valid &&
            <div className={"salary-pill" + (completed ? " clickable" : "")}
                 onClick={onClick}>
                <Loader show={!completed}/>
                {completed && getSalaryValue(salary)}
            </div>}
        </React.Fragment>
    );
};