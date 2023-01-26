import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, BACKEND_SIGN_IN, extractIdFromUrl, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Loader} from "../components/Loader";

// @ts-ignore
import stylesheet from "./SalaryPill.scss";

type Props = {
    url: string
    disabled?: boolean
};

export const SalaryPill: React.FC<Props> = ({url, disabled}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [salary, setSalary] = useState({result: {formattedPay: "", note: ""}} as any);
    const [completed, setCompleted] = useState(true);
    const [disabledInternal, setDisabledInternal] = useState(disabled);

    useEffect(() => {
        if (disabledInternal) {
            setSalary({result: {formattedPay: "Sign in", note: "Please, sign in to use premium features"}});
            return;
        }
        const id = extractIdFromUrl(url);
        setCompleted(false);
        messages.request<IAppRequest, any>({
            type: AppMessageType.SalaryPill,
            payload: id
        }, (r) => {
            setCompleted(true);
            if (r.error) {
                setSalary({result: {formattedPay: "N/A", note: r.error}});
                setDisabledInternal(r.status == 403)
            } else {
                setSalary(r);
            }
        }).then(/* nada */);
    }, []);

    const onClick = () => {
        if (disabledInternal) {
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
            <div className={"salary-pill" + (disabledInternal ? " disabled" : "")} onClick={onClick}
                 title={salary.result.note}>
                <Loader show={!completed}/>
                {completed && getSalaryValue()}
            </div>
        </React.Fragment>
    );
};