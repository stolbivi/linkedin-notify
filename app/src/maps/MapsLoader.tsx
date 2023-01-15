import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, MAPS_KEY, MESSAGE_ID, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";
import "./MapLoader.scss";
import {Clock} from "../icons/Clock";

type Props = {};

interface Tz {
    timezones: Array<string>
    timeFull: string
    timeFormatted: string
}

export const MapsLoader: React.FC<Props> = ({}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [src, setSrc] = useState<string>();
    const [tz, setTz] = useState<Tz>();
    const [city, setCity] = useState<string>();

    const mapContainer = React.createRef<HTMLIFrameElement>();
    const ZOOM = 8;

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
            console.log(r);
            if (r.geo) {
                // setting map
                const {lat, lng, city} = r.geo;
                setCity(city);
                setSrc(`https://www.google.com/maps/embed/v1/place?q=${lat},${lng}&key=${MAPS_KEY}&zoom=${ZOOM}`);
                // setting time
                setTz(r.tz);
            } else {
                console.error(r);
            }
        }).then(/* nada */);
    }, [])

    return (
        <div className="map-loader">
            {tz && city &&
            <div className="timezone-container">
                <div className="timezone" title={tz.timeFull}>
                    <Clock/><span>{`${city} - ${tz.timeFormatted}`}</span>
                </div>
            </div>}
            <div className="map-sub-container">
                <iframe scrolling="no" height="200" ref={mapContainer} src={src}></iframe>
            </div>
        </div>
    );

};