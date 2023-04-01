import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../../global";
import {StageEnum, StageLabels} from "./StageSwitch";
import {injectLastChild} from "../../utils/InjectHelper";
import {Loader} from "../../components/Loader";
import {AccessGuard, AccessState} from "../AccessGuard";

// @ts-ignore
import stylesheet from "./StageSwitch.scss";
import { getConversationProfile, getStages, showNotesAndCharts} from "../../actions";

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
    if (window.location.href.indexOf("/messaging/") > 0){
        const nameContainer = document.getElementsByClassName("artdeco-entity-lockup__badge ember-view");
        if (nameContainer && nameContainer.length > 0) {
            const nameHeader = nameContainer[0].getElementsByClassName("artdeco-entity-lockup__degree");
            if (nameHeader && nameHeader.length > 0) {
                (nameHeader[0].parentElement as HTMLElement).style.paddingRight = "0.5em";
                injectLastChild(nameHeader[0].parentElement, "lnm-stage",
                    <StagePill convUrl={window.location.href}/>
                );
            }
        }
    }
}

type Props = {
    url?: string,
    convUrl?: string
};

export const StagePill: React.FC<Props> = ({url, convUrl}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [type, setType] = useState<StageEnum>(-1);
    const [completed, setCompleted] = useState<boolean>(false);
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const [urlInternal, setUrlInternal] = useState<string>(url || convUrl);

    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        if (accessState !== AccessState.Valid || !urlInternal) {
            return;
        }
        if(convUrl) {
            messages.request(getConversationProfile(extractIdFromUrl(convUrl)))
                .then((r:any) => {
                    const entityUrns = r.participants.map((participant:any) => {
                        return participant["com.linkedin.voyager.messaging.MessagingMember"].miniProfile.entityUrn.split(":")[3];
                    });
                    messages.request(getStages({url: entityUrns[0]}))
                        .then((r) => {
                            if (r.error) {
                                console.error(r.error);
                            } else {
                                const s = r?.response?.stage >= 0 ? r?.response?.stage : -1;
                                setType(s);
                            }
                        }).finally(() => setCompleted(true));
                });
        } else {
            messages.request(getStages({url: extractIdFromUrl(urlInternal)}))
                .then((r) => {
                    if (r.error) {
                        console.error(r.error);
                    } else {
                        const s = r?.response?.stage >= 0 ? r?.response?.stage : -1;
                        setType(s);
                    }
                }).finally(() => setCompleted(true));
        }
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
            return messages.request(showNotesAndCharts({showSalary: false, showNotes: true}));
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