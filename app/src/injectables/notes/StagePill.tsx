import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../../global";
import {StageEnum, StageLabels} from "./StageSwitch";
import {injectLastChild} from "../../utils/InjectHelper";
import {Loader} from "../../components/Loader";
import {AccessGuard, AccessState} from "../AccessGuard";

// @ts-ignore
import stylesheet from "./StageSwitch.scss";
import {getLatestStage, getTheme, showNotesAndCharts, SwitchThemePayload} from "../../actions";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../../themes/ThemeUtils";
import {theme as LightTheme} from "../../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../../themes/dark";

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
                    <StagePill url={window.location.href} showStages={true}/>, "StagePill"
                );
            }
        }
    }
    setTimeout(() => {
        if (window.location.href.indexOf("/messaging/") > 0){
            const nameContainer = document.getElementsByClassName("artdeco-entity-lockup__badge ember-view");
            if (nameContainer && nameContainer.length > 0) {
                const nameHeader = nameContainer[0].getElementsByClassName("artdeco-entity-lockup__degree");
                if (nameHeader && nameHeader.length > 0) {
                    (nameHeader[0].parentElement as HTMLElement).style.paddingRight = "0.5em";
                    injectLastChild(nameHeader[0].parentElement, "lnm-stage",
                        <StagePill convUrl={window.location.href} showStages={true}/>, "StagePill"
                    );
                }
            }
        }
    }, 700);
}

type Props = {
    url?: string,
    convUrl?: string
    showStages?: boolean
};

export const StagePill: React.FC<Props> = ({url, convUrl, showStages}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [type, setType] = useState<StageEnum>(-1);
    const [completed, setCompleted] = useState<boolean>(false);
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const [urlInternal, setUrlInternal] = useState<string>(url || convUrl);
    const [stageText, setStageText] = useState(null);
    const messages = new MessagesV2(VERBOSE);
    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

    useEffect(() => {
        if (accessState !== AccessState.Valid || !urlInternal) {
            return;
        }
        let url = extractIdFromUrl(urlInternal);
        if(convUrl) {
            url = sessionStorage.getItem("prf");
        }
        messages.request(getLatestStage(url))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                } else {
                    const s = r?.stage >= 0 ? r?.stage : -1;
                    setType(s);
                    setStageText(r?.stageText ? r?.stageText : null);
                }
            }).finally(() => setCompleted(true));

    }, [accessState, urlInternal]);

    useEffect(() => {
        const listener = () => {
            setUrlInternal(window.location.href);
        }
        window.addEventListener('popstate', listener);

        return () => window.removeEventListener('popstate', listener)
    }, [window.location.href])


    useEffect(() => {
        messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                updateTheme(payload.theme);
                return Promise.resolve();
            }));
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                let theme = payload.theme === "light" ? LightTheme : DarkTheme;
                setThemeUtil(theme, rootElement);
                return Promise.resolve();
            }));
    }, []);

    const onClick = () => {
        if (showNotes) {
            setShowNotes(false);
        } else {
            return messages.request(showNotesAndCharts({showSalary: false, showNotes: true, showStages}));
        }
    }

    const getText = () => completed ? (StageLabels[type] ? StageLabels[type].label : stageText) : "Loading";

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16"}
                         loaderClassName="loader-base loader-px24"/>
            {accessState === AccessState.Valid &&
                <div className={`stage ${StageLabels[type] ? StageLabels[type].class : 'interested'}`} onClick={onClick} style={{marginLeft: "1em"}} ref={rootElement}>
                    <div className="loader"><Loader show={!completed}/></div>
                    <label className="ellipsis" style={{opacity: completed ? 1 : 0}}>{getText()}</label>
                </div>}
        </React.Fragment>
    );
}