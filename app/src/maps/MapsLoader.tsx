import React, {useEffect, useState} from "react";
import {BACKEND_STATIC, VERBOSE} from "../global";
import {MessagesV2} from "@stolbivi/pirojok";
import "./MapLoader.scss";
import {Clock} from "../icons/Clock";
import moment from "moment";
import {getTz} from "../actions";

type Props = {};

interface Tz {
    timeFull: string
    timeFormatted: string
}

export const MapsLoader: React.FC<Props> = ({}) => {

    const messages = new MessagesV2(VERBOSE);
    const FORMAT = "DD.MM.YYYY HH:mm:ss";
    const FORMAT_TIME = "HH:mm";
    const FORMAT_DDDD = "dddd";

    const [src, setSrc] = useState<string>();
    const [tz, setTz] = useState<Tz>();
    const [city, setCity] = useState<string>();
    const [disabled, setDisabled] = useState<boolean>(false);

    const mapContainer = React.createRef<HTMLIFrameElement>();

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
        const searchParams = new URLSearchParams(window.location.search);
        if (!searchParams.has("id")) {
            console.error("Request parameters must include user id");
            return;
        }
        messages.request(getTz(searchParams.get("id")))
            .then((r) => {
                if (r.geo && r.tz) {
                    // setting map
                    const {lat, lng, city} = r.geo;
                    setCity(city);
                    setSrc(`${BACKEND_STATIC}map.html?lat=${lat}&lng=${lng}&zoom=8`);
                    // setting time
                    setInterval(() => updateTime(r.tz), 1000);
                } else {
                    if (r.error) {
                        setDisabled(true);
                    }
                }
            });
    }, [])

    return (
        <div className="map-loader">
            <div className="map-sub-container">
                {!disabled &&
                    <React.Fragment>
                        {tz?.timeFormatted && city &&
                            <div className="timezone" title={`${city} - ${tz.timeFull}`}>
                                <Clock/><span>{tz.timeFormatted}</span>
                            </div>}
                        <iframe scrolling="no" height="200" ref={mapContainer} src={src}></iframe>
                    </React.Fragment>
                }
            </div>
        </div>
    );

};