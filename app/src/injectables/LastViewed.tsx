import React, {useEffect, useState} from "react";
import {extractIdFromUrl} from "../global";
import {injectLastChild} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";
import {Clock} from "../icons/Clock";
import {Loader} from "../components/Loader";
import {formatDateToday} from "../services/UIHelpers";
import {Provider, shallowEqual, useSelector} from "react-redux";
import {CompleteEnabled, localStore, selectLastViewed} from "../store/LocalStore";
import {getLastViewedAction, LastViewed as LastViewedData} from "../store/LastViewedReducer";

// @ts-ignore
import stylesheet from "./LastViewed.scss";
import {useUrlChangeSupport} from "../utils/URLChangeSupport";
import {getLastViewed, getTheme, setLastViewed as setLastViewedAction, SwitchThemePayload} from "../actions";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../themes/ThemeUtils";
import {theme as LightTheme} from "../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../themes/dark";

export const LastViewedFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const badgeWrap = document.getElementsByClassName("pv-top-card__badge-wrap");
        if (badgeWrap && badgeWrap.length > 0) {
            let parent = badgeWrap[0].parentElement.parentElement.parentElement;
            parent.style.position = "relative";
            injectLastChild(parent, "lnm-last-viewed",
                <Provider store={localStore}>
                    <LastViewed/>
                </Provider>
            );
        }
    }
}

type Props = {};

export const LastViewed: React.FC<Props> = ({}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const lastViewed: CompleteEnabled<LastViewedData> = useSelector(selectLastViewed, shallowEqual);
    const [url] = useUrlChangeSupport(window.location.href);
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
            localStore.dispatch(getLastViewedAction(extractIdFromUrl(url)));
        }
    }, [url]);

    const canShow = () => !lastViewed.hide;

    const getLastViewedValue = (lastViewed: CompleteEnabled<LastViewedData>) => {
        if (lastViewed.updatedAt) {
            return new Date(lastViewed.updatedAt);
        } else {
            return new Date();
        }
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState}
                         className={"access-guard-px16 top-right-corner"}
                         loaderClassName="loader-base top-right-corner loader-px24"/>
            {accessState === AccessState.Valid && canShow() &&
                <div className="last-viewed top-right-corner">
                    <Loader show={!lastViewed.completed}/>
                    {lastViewed.completed &&
                        <React.Fragment>
                            <Clock/>
                            <label>Last viewed on:</label>
                            <span>{formatDateToday(getLastViewedValue(lastViewed))}</span>
                        </React.Fragment>}
                </div>}
        </React.Fragment>
    );
}