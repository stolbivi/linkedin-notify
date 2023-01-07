import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, extractIdFromUrl, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
// @ts-ignore
import stylesheet from "./SalaryPill.scss";
import {Loader} from "../components/Loader";

type Props = {
    url: string
};

export const SalaryPill: React.FC<Props> = ({url}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [salary, setSalary] = useState({result: {formattedPay: ".", note: ""}} as any);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const id = extractIdFromUrl(url);
        messages.request<IAppRequest, any>({
            type: AppMessageType.SalaryPill,
            payload: id
        }, (r) => {
            if (r.error) {
                console.error(r.error);
                setSalary({result: {formattedPay: "N/A", note: r.error}});
            } else {
                setSalary(r);
            }
            setCompleted(true);
        }).then(/* nada */);
    }, []);

    const cancel = () => {
        setCompleted(true);
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
            <div className="salary-pill" onClick={cancel} title={salary.result.note}>
                <Loader show={!completed}/>
                {completed && getSalaryValue()}
            </div>
        </React.Fragment>
    );
};