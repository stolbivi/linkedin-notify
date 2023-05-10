import React, {useEffect, useState} from "react";
import {extractIdFromUrl, VERBOSE} from "../global";
import {Loader} from "../components/Loader";
import {inject} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";
import {CompleteEnabled, localStore, selectSalary} from "../store/LocalStore";
import {Provider, shallowEqual, useSelector} from "react-redux";
import {showNotesAndChartsAction} from "../store/ShowNotesAndCharts";
import {getSalaryAction, Salary} from "../store/SalaryReducer";
// @ts-ignore
import stylesheet from "./SalaryPill.scss";
import {useUrlChangeSupport} from "../utils/URLChangeSupport";
import {getCustomSalary, getMe} from "../actions";
import {MessagesV2} from "@stolbivi/pirojok";

export const SalaryPillFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const profileActions = document.getElementsByClassName("pv-top-card-v2-ctas");
        if (profileActions && profileActions.length > 0) {
            const actions = profileActions[0].getElementsByClassName("pvs-profile-actions");
            if (actions && actions.length > 0) {
                inject(actions[0], "lnm-salary", "after",
                    <Provider store={localStore}>
                        <SalaryPill showSalary={true} id={extractIdFromUrl(window.location.href)} trackUrl={true}/>
                    </Provider>, "Salary"
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
                            <Provider store={localStore}>
                                <SalaryPill url={link} id={id} showSalary={true}/>
                            </Provider>, "Salary"
                        );
                    }
                }
            })
        }
    }
}

type Props = {
    id: string
    url?: string
    showSalary?: boolean
    showNotes?: boolean
    trackUrl?: boolean
};

export const getSalaryValue = (salary: Salary) => {
    if (salary?.progressivePay) {
        return salary?.progressivePay;
    } else {
        return salary?.formattedPay;
    }
}

export const SalaryPill: React.FC<Props> = ({url, id, showSalary = false, showNotes = false, trackUrl = false}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const salary: CompleteEnabled<Salary> = useSelector(selectSalary, shallowEqual)[id];
    const [salaryInternal, setSalaryInternal] = useState(salary);
    const [urlInternal] = useUrlChangeSupport(window.location.href);
    const [show, setShow] = useState(true);
    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        setShow(true);
        if (accessState !== AccessState.Valid || !urlInternal) {
            return;
        }
        const userId = extractIdFromUrl(window.location.href);
        messages.request(getMe()).then(res => {
            if(userId === res.miniProfile.publicIdentifier) {
                setShow(false);
            } else {
                if (!salary?.completed) {
                    localStore.dispatch(getSalaryAction({id: id, state: {id: extractIdFromUrl(trackUrl ? urlInternal : url)}}));
                }
            }
        });
    }, [accessState, urlInternal]);

    useEffect(() => {
        setSalaryInternal(salary);
    },[salary]);

    useEffect(() => {
        if(salary?.completed) {
            sessionStorage.setItem("customSalary", JSON.stringify(salary));
            messages.request(getCustomSalary(salary.urn)).then(resp => {
                if(resp && resp.length > 0) {
                    const clonedSalary = JSON.parse(JSON.stringify(salary));
                    clonedSalary.payDistributionValues[0] = resp[0]?.leftPayDistribution;
                    clonedSalary.payDistributionValues[clonedSalary.payDistributionValues.length - 1] = resp[0]?.rightPayDistribution;
                    clonedSalary.payDistribution[0] = resp[0]?.leftPayDistribution;
                    clonedSalary.payDistribution[clonedSalary.payDistribution.length - 1] = resp[0]?.rightPayDistribution;
                    clonedSalary.progressivePay = resp[0]?.progressivePay;
                    clonedSalary.progressivePayValue = resp[0]?.progressivePay;
                    clonedSalary.formattedPay = resp[0]?.progressivePay?.replace(/[^0-9]/g, '');
                    clonedSalary.formattedPayValue = resp[0]?.progressivePay?.replace(/[^0-9]/g, '');
                    setSalaryInternal(clonedSalary);
                    sessionStorage.setItem("customSalary", JSON.stringify(clonedSalary));
                }
            })
        }
    },[salary]);

    const onClick = () => {
        if (salary) {
            localStore.dispatch(showNotesAndChartsAction({id: id, state: {showSalary, showNotes, show: true, id: id}}));
        }
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16"}
                         loaderClassName={"loader-base loader-px24"}/>
            {accessState === AccessState.Valid && show &&
                <div className={"salary-pill" + (salary?.completed ? " clickable" : "")}
                     onClick={onClick}>
                    <Loader show={!salary?.completed}/>
                    {salary?.completed && salary && <span>{getSalaryValue(salaryInternal)}</span>}
                </div>}
        </React.Fragment>
    );
};