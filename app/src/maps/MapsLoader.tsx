import React, {useEffect, useState} from "react";
import {AppMessageType, BACKEND_STATIC, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";
import "./MapLoader.scss";
import {Clock} from "../icons/Clock";
import moment from "moment";

type Props = {};

interface Tz {
    timeFull: string
    timeFormatted: string
}

export const MapsLoader: React.FC<Props> = ({}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);
    const FORMAT = "DD.MM.YYYY HH:mm:ss";
    const FORMAT_TIME = "HH:mm";
    const FORMAT_DDDD = "dddd";

    const [src, setSrc] = useState<string>();
    const [tz, setTz] = useState<Tz>();
    const [city, setCity] = useState<string>();

    const mapContainer = React.createRef<HTMLIFrameElement>();

    const updateTime = (tz: any) => {
        const utc = moment.utc();
        const timeZoned = utc.add(tz.utcOffset, "minutes");
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
        messages.request<IAppRequest, any>({
            type: AppMessageType.Map,
            payload: searchParams.get("id")
        }, (r) => {
            if (r.geo) {
                // setting map
                const {lat, lng, city} = r.geo;
                setCity(city);
                setSrc(`${BACKEND_STATIC}map.html?lat=${lat}&lng=${lng}&zoom=8`);
                // setting time
                setInterval(() => updateTime(r.tz), 1000);
            } else {
                console.error(r);
            }
        }).then(/* nada */);
    }, [])

    return (
        <div className="map-loader">
            {tz && city &&
            <div className="timezone" title={`${city} - ${tz.timeFull}`}>
                <Clock/><span>{tz.timeFormatted}</span>
            </div>}
            <div className="map-sub-container">
                <iframe scrolling="no" height="200" ref={mapContainer} src={src}></iframe>
            </div>
        </div>
    );

};