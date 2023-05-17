import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
import {injectFirstChild} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";
import {Loader} from "../components/Loader";
import {formatDateToday} from "../services/UIHelpers";
// @ts-ignore
import stylesheet from "./LastSeen.scss";
import {getLastSeen, getTheme, SwitchThemePayload} from "../actions";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../themes/ThemeUtils";
import {theme as LightTheme} from "../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../themes/dark";
import icon from "../../public/content/icon-256.png";

export const LastSeenFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const badgeWrap = document.getElementsByClassName("pv-text-details__right-panel");
        if (badgeWrap && badgeWrap.length > 0) {
            let parent = badgeWrap[0].parentElement.parentElement.parentElement;
            parent.style.position = "relative";
            injectFirstChild(badgeWrap[0], "lnm-last-seen",
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
                    } else {
                        setLastSeen(r?.response?.lastActiveAt !== 0 ? new Date(r?.response?.lastActiveAt) : null);
                    }
                }
            }).finally(() => setCompleted(true));
    }, []);

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState}
                         className={"access-guard-px16 top-right-corner"}
                         loaderClassName="loader-base top-right-corner loader-px24"/>
            {accessState === AccessState.Valid && show &&
                <div className="last-seen" ref={rootElement}>
                    <Loader show={!completed}/>
                    {completed &&
                        <React.Fragment>
                            <img width={15} height={15} src={icon}/>
                            <label>Last Seen On Linkedin:</label>
                            <span>{lastSeen ? formatDateToday(lastSeen) : 'Unknown'}</span>
                        </React.Fragment>}
                </div>}
        </React.Fragment>
    );
}