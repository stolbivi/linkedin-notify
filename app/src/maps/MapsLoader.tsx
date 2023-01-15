import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, MAPS_KEY, MESSAGE_ID, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";
import "./MapLoader.scss";

type Props = {};

export const MapsLoader: React.FC<Props> = ({}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [src, setSrc] = useState<string>();

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
            if (r.status === "OK") {
                const {lat, lng} = r.results[0].geometry.location;
                const q = `${lat},${lng}`;
                setSrc(`https://www.google.com/maps/embed/v1/place?q=${q}&key=${MAPS_KEY}&zoom=${ZOOM}`);
            } else {
                console.error(r);
            }
        }).then(/* nada */);
    }, [])

    return (
        <div className="map-loader">
            <div className="map-sub-container">
                <iframe scrolling="no" height="200" ref={mapContainer} src={src}></iframe>
            </div>
        </div>
    );

};