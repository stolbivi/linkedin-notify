import React, {useEffect, useState} from "react";
import {injectLastChild} from "../utils/InjectHelper";
// @ts-ignore
import stylesheet from "./TimeZone.scss";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
import moment from "moment";
import {getConversationProfile, getTz} from "../actions";
import {Clock} from "../icons/Clock";


export const TimeZoneFactory = () => {
    if (window.location.href.indexOf("/messaging/") > 0) {
        const timeWrap = document.getElementsByClassName("break-words artdeco-entity-lockup artdeco-entity-lockup--stacked-left artdeco-entity-lockup--size-5 ember-view");
        if (timeWrap && timeWrap.length > 0) {
            let child = timeWrap[0].getElementsByTagName("a");
            if (child && child.length > 0) {
                injectLastChild(child[0], "lnm-time-zone", <TimeZone/>);
            }
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
    const FORMAT = "DD.MM.YYYY HH:mm:ss";
    const FORMAT_TIME = "HH:mm";
    const FORMAT_DDDD = "dddd";

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

        messages.request(getConversationProfile(extractIdFromUrl(window.location.href)))
            .then((r:any) => {
                const entityUrns = r.participants.map((participant:any) => {
                    return participant["com.linkedin.voyager.messaging.MessagingMember"].miniProfile.entityUrn.split(":")[3];
                });
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
            {!disabled &&
                <React.Fragment>
                    {tz?.timeFormatted && city &&
                        <div className="time-zone top-right-corner" title={`${city} - ${tz.timeFull}`}>
                            <Clock/><span>{tz.timeFormatted}</span>
                        </div>
                    }
                </React.Fragment>
            }
        </React.Fragment>
    );
}
