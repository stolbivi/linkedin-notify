import React, {useEffect, useState} from "react";
import {extractIdFromUrl} from "../global";
import {Loader} from "../components/Loader";
import {inject} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";
import {CompleteEnabled, localStore, selectSalary} from "../store/LocalStore";
import {Provider, shallowEqual, useSelector} from "react-redux";
import {showNotesAndChartsAction} from "../store/ShowNotesAndCharts";
import {getMe,getSalaryAction, Salary} from "../store/SalaryReducer";
// @ts-ignore
import stylesheet from "./SalaryPill.scss";
import {useUrlChangeSupport} from "../utils/URLChangeSupport";

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
                                <SalaryPill url={link} id={id}/>
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
    if (salary.progressivePay) {
        return salary.progressivePay;
    } else {
        return salary.formattedPay;
    }
}

export const SalaryPill: React.FC<Props> = ({url, id, showSalary = false, showNotes = false, trackUrl = false}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const salary: CompleteEnabled<Salary> = useSelector(selectSalary, shallowEqual)[id];
    const [urlInternal] = useUrlChangeSupport(window.location.href);
    const [show, setShow] = useState(true);

    useEffect(() => {
        if (accessState !== AccessState.Valid || !urlInternal) {
            return;
        }
        if (!salary?.completed) {
            localStore.dispatch(getSalaryAction({id: id, state: extractIdFromUrl(trackUrl ? urlInternal : url)}));
        }
    }, [accessState, urlInternal]);

    const onClick = () => {
        if (salary) {
            localStore.dispatch(showNotesAndChartsAction({id: id, state: {showSalary, showNotes, show: true}}));
        }
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16"}
                         loaderClassName={"loader-base loader-px24"}/>
            {accessState === AccessState.Valid && show &&
                <div className={"salary-pill" + (completed ? " clickable" : "")}
                     onClick={onClick}>
                    <Loader show={!salary?.completed}/>
                    {salary?.completed && salary && <span>{getSalaryValue(salary)}</span>}
                </div>}
        </React.Fragment>
    );
};