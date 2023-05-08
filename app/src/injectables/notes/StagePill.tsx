import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../../global";
import {StageLabels} from "./StageSwitch";
import {injectLastChild} from "../../utils/InjectHelper";
import {Loader} from "../../components/Loader";
import {AccessGuard, AccessState} from "../AccessGuard";
import {CompleteEnabled, IdAwareState, localStore, selectStage} from "../../store/LocalStore";
import {Provider, shallowEqual, useSelector} from "react-redux";
import {showNotesAndChartsAction} from "../../store/ShowNotesAndCharts";
import {getLatestStageAction, Stage} from "../../store/StageReducer";
import {useUrlChangeSupport} from "../../utils/URLChangeSupport";
// @ts-ignore
import stylesheet from "./StageSwitch.scss";
import {getTheme, SwitchThemePayload} from "../../actions";
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
                    <Provider store={localStore}>
                        <StagePill id={extractIdFromUrl(window.location.href)}/>
                    </Provider>, "StagePill"
                );
            }
        }
    }
    setTimeout(() => {
        if (window.location.href.indexOf("/messaging/") > 0) {
            const nameContainer = document.getElementsByClassName("artdeco-entity-lockup__badge ember-view");
            if (nameContainer && nameContainer.length > 0) {
                const nameHeader = nameContainer[0].getElementsByClassName("artdeco-entity-lockup__degree");
                if (nameHeader && nameHeader.length > 0) {
                    (nameHeader[0].parentElement as HTMLElement).style.paddingRight = "0.5em";
                    injectLastChild(nameHeader[0].parentElement, "lnm-stage",
                        <Provider store={localStore}>
                            <StagePill id={extractIdFromUrl(window.location.href)} usePrf/>
                        </Provider>, "StagePill"
                    );
                }
            }
        }
    }, 700);
}

type Props = {
    id: string
    usePrf?: boolean
};

export const StagePill: React.FC<Props> = ({id, usePrf}) => {

    const [idInternal, setIdInternal] = useState<string>(id);
    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const stages: IdAwareState<CompleteEnabled<Stage>> = useSelector(selectStage, shallowEqual);
    const [url] = useUrlChangeSupport(window.location.href);
    const messages = new MessagesV2(VERBOSE);
    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

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

    useEffect(() => {
        if (url?.length > 0) {
            setIdInternal(extractIdFromUrl(url));
        }
    }, [url]);

    useEffect(() => {
        if (accessState !== AccessState.Valid || !idInternal) {
            return;
        }
        let urlRequest = usePrf ? sessionStorage.getItem("prf") : idInternal;
        setTimeout(() => {
            localStore.dispatch(getLatestStageAction({id: idInternal, state: {url: urlRequest}}));
        },400)
    }, [idInternal, accessState]);

    const onClick = () => {
        if (showNotes) {
            setShowNotes(false);
        } else {
            localStore.dispatch(showNotesAndChartsAction({
                id: idInternal,
                state: {showSalary: false, showNotes: true, show: true}
            }));
        }
    }

    const extractFromIdAware = (): CompleteEnabled<any> => stages && stages[idInternal] ? stages[idInternal] : {};

    const getStage = () => extractFromIdAware().stage >= 0 ? extractFromIdAware().stage : -1;

    const getText = () => extractFromIdAware().completed ? (StageLabels[getStage()] ? StageLabels[getStage()].label : getStage().stageText) : "Loading"

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16"}
                         loaderClassName="loader-base loader-px24"/>
            {accessState === AccessState.Valid &&
                <div className={`stage ${StageLabels[getStage()] ? StageLabels[getStage()].class : 'interested'}`} onClick={onClick} style={{marginLeft: "1em"}} ref={rootElement}>
                    <div className="loader"><Loader show={!extractFromIdAware().completed}/></div>
                    <label className="ellipsis ellipsis-stage-pill" style={{opacity: extractFromIdAware().completed ? 1 : 0, }}>{getText()}</label>
                </div>}
        </React.Fragment>
    );
}