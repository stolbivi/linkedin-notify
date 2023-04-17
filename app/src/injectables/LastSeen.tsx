import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
import {injectLastChild} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";
import {Clock} from "../icons/Clock";
import {Loader} from "../components/Loader";
import {formatDateToday} from "../services/UIHelpers";

// @ts-ignore
import stylesheet from "./LastSeen.scss";
import {getLastSeen, getTheme, setLastSeen as setLastSeenAction, SwitchThemePayload} from "../actions";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../themes/ThemeUtils";
import {theme as LightTheme} from "../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../themes/dark";

export const LastSeenFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const badgeWrap = document.getElementsByClassName("pv-top-card__badge-wrap");
        if (badgeWrap && badgeWrap.length > 0) {
            let parent = badgeWrap[0].parentElement.parentElement.parentElement;
            parent.style.position = "relative";
            injectLastChild(parent, "lnm-last-seen",
                <LastSeen/>, "LastSeen"
            );
        }
    }
}

type Props = {};

export const LastSeen: React.FC<Props> = ({}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [show, setShow] = useState<boolean>(true);
    const [completed, setCompleted] = useState<boolean>(false);
    const [lastSeen, setLastSeen] = useState<Date>();

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
        messages.request(getLastSeen(extractIdFromUrl(window.location.href)))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                } else {
                    if (r?.response?.hide) {
                        setShow(false);
                    } else if (r?.response?.length > 0) {
                        setLastSeen(new Date(r?.response[0].updatedAt));
                    } else {
                        setLastSeen(new Date());
                    }
                }
            }).finally(() => setCompleted(true));
    }, []);

    useEffect(() => {
        if (lastSeen) {
            messages.request(setLastSeenAction(extractIdFromUrl(window.location.href)))
                .then((r) => {
                    if (r.error) {
                        console.error(r.error);
                    }
                }).finally(() => setCompleted(true));
        }
    }, [lastSeen]);

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState}
                         className={"access-guard-px16 top-right-corner"}
                         loaderClassName="loader-base top-right-corner loader-px24"/>
            {accessState === AccessState.Valid && show &&
                <div className="last-seen top-right-corner" ref={rootElement}>
                    <Loader show={!completed}/>
                    {completed &&
                        <React.Fragment>
                            <Clock/>
                            <label>Last Seen on:</label>
                            <span>{formatDateToday(lastSeen)}</span>
                        </React.Fragment>}
                </div>}
        </React.Fragment>
    );
}