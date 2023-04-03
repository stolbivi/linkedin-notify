import React, {useEffect, useState} from "react";
import {injectLastChild} from "../utils/InjectHelper";
// @ts-ignore
import stylesheet from "./TimeZone.scss";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
import moment from "moment";
import {getConversationProfile, getTheme, getTz, SwitchThemePayload} from "../actions";
import {Clock} from "../icons/Clock";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../themes/ThemeUtils";
import {theme as LightTheme} from "../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../themes/dark";
import {AccessGuard, AccessState} from "./AccessGuard";

export const LnMenuFactory = () => {
    if (window.location.href.indexOf("/messaging/") > 0) {
        const timeWrap = document.getElementsByClassName("artdeco-entity-lockup__image artdeco-entity-lockup__image--type-circle ember-view");
        if (timeWrap && timeWrap.length > 0) {
                injectLastChild(timeWrap[0], "lnm-time-zone", <TimeZone/>);
        }
    }
}

type Props = {};

interface Tz {
    timeFull: string
    timeFormatted: string
}

export const TimeZone: React.FC<Props> = ({}) => {

    const messages = new MessagesV2(VERBOSE);
    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);
    const FORMAT = "DD.MM.YYYY HH:mm:ss";
    const FORMAT_TIME = "HH:mm";
    const FORMAT_DDDD = "dddd";
    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [tz, setTz] = useState<Tz>();
    const [city, setCity] = useState<string>();
    const [disabled, setDisabled] = useState<boolean>(false);

    const updateTime = (tz: any) => {
        const utc = moment.utc();
        const timeZoned = tz.utcOffset ? utc.add(tz.utcOffset, "minutes") : utc;
        const timeFull = timeZoned.format(FORMAT);
        const time = timeZoned.format(FORMAT_TIME);
        const dayOfWeek = timeZoned.format(FORMAT_DDDD);
        const timeFormatted = `${dayOfWeek.substring(0, 3)}, ${time} ${tz.timeZoneFormatted}`;
        setTz({timeFull, timeFormatted});
    }

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

        messages.request(getConversationProfile(extractIdFromUrl(window.location.href)))
            .then((r:any) => {
                const entityUrns = r.participants.map((participant:any) => {
                    return participant["com.linkedin.voyager.messaging.MessagingMember"].miniProfile.entityUrn.split(":")[3];
                });
                sessionStorage.setItem("prf",entityUrns[0]);
                messages.request(getTz(entityUrns[0]))
                    .then((r) => {
                        if (r.geo && r.tz) {
                            const {city} = r.geo;
                            setCity(city);
                            setInterval(() => updateTime(r.tz), 1000);
                        } else {
                            if (r.error) {
                                setDisabled(true);
                            }
                        }
                    });
            });
    }, []);

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16 lock-time"}
                         loaderClassName="loader-base loader-px24"/>
            {accessState === AccessState.Valid &&
                !disabled &&
                <React.Fragment>
                    {tz?.timeFormatted && city &&
                        <div className="time-zone" title={`${city} - ${tz.timeFull}`} ref={rootElement}>
                            <Clock/><span>{tz.timeFormatted}</span>
                        </div>
                    }
                </React.Fragment>
            }
        </React.Fragment>
    );
}
