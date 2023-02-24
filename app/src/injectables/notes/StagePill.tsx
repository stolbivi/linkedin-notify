import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, extractIdFromUrl, IAppRequest, MESSAGE_ID, VERBOSE} from "../../global";
import {StageEnum, StageLabels} from "./StageSwitch";
import {injectLastChild} from "../../utils/InjectHelper";
import {Loader} from "../../components/Loader";
import {AccessGuard, AccessState} from "../AccessGuard";

// @ts-ignore
import stylesheet from "./StageSwitch.scss";

export const StagePillFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const headerContainer = document.getElementsByClassName("pv-text-details__left-panel");
        if (headerContainer && headerContainer.length > 0) {
            const header = headerContainer[0].getElementsByTagName("h1");
            if (header && header.length > 0) {
                header[0].parentElement.style.display = "flex";
                header[0].style.paddingRight = "0.5em";
                injectLastChild(header[0].parentElement, "lnm-stage",
                    <StagePill url={window.location.href}/>
                );
            }
        }
    }
}

type Props = {
    url: string
};

export const StagePill: React.FC<Props> = ({url}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [type, setType] = useState<StageEnum>(-1);
    const [completed, setCompleted] = useState<boolean>(false);
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const [urlInternal, setUrlInternal] = useState<string>(url);

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    useEffect(() => {
        if (accessState !== AccessState.Valid || !urlInternal) {
            return;
        }
        messages.request<IAppRequest, any>({
            type: AppMessageType.Stage,
            payload: {url: extractIdFromUrl(urlInternal)}
        }, (r) => {
            if (r.error) {
                console.error(r.error);
            } else {
                const s = r?.response?.stage >= 0 ? r?.response?.stage : -1;
                setType(s);
            }
        }).finally(() => setCompleted(true));

    }, [accessState, urlInternal]);

    useEffect(() => {
        window.addEventListener('popstate', () => {
            setUrlInternal(window.location.href);
        });
    }, [])

    const onClick = () => {
        if (showNotes) {
            setShowNotes(false);
        } else {
            setCompleted(false);
            messages.request({
                type: AppMessageType.NotesAndCharts,
                payload: {showSalary: false, showNotes: true}
            }).finally(() => setCompleted(true));
        }
    }

    const getText = () => completed ? StageLabels[type].label : "Loading"

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16"}
                         loaderClassName="loader-base loader-px24"/>
            {accessState === AccessState.Valid &&
            <div className={"stage " + StageLabels[type].class} onClick={onClick} style={{marginLeft: "1em"}}>
                <div className="loader"><Loader show={!completed}/></div>
                <label style={{opacity: completed ? 1 : 0}}>{getText()}</label>
            </div>}
        </React.Fragment>
    );
}