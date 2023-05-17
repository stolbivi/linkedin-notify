import React, {useEffect, useState} from "react";
import {BACKEND_STATIC} from "../global";
import "./MapLoader.scss";
import {Clock} from "../icons/Clock";
import moment from "moment";
import {GeoTz} from "../actions";
import {CompleteEnabled, localStore, selectGeoTz} from "../store/LocalStore";
import {shallowEqual, useSelector} from "react-redux";
import {getGeoTzAction} from "../store/GeoTzReducer";
import { AccessGuard, AccessState } from "../injectables/AccessGuard";

type Props = {};

interface Tz {
    timeFull: string
    timeFormatted: string
}

export const MapsLoader: React.FC<Props> = ({}) => {

    const FORMAT = "DD.MM.YYYY HH:mm:ss";
    const FORMAT_TIME = "HH:mm";
    const FORMAT_DDDD = "dddd";

    const geoTz: CompleteEnabled<GeoTz> = useSelector(selectGeoTz, shallowEqual);
    const [src, setSrc] = useState<string>();
    const [tz, setTz] = useState<Tz>();
    const [city, setCity] = useState<string>();
    const [disabled, setDisabled] = useState<boolean>(false);
    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);

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
        if(accessState !== AccessState.Valid) return;
        if (geoTz?.geo && geoTz?.tz) {
            // setting map
            const {lat, lng, city} = geoTz.geo;
            setCity(city);
            setSrc(`${BACKEND_STATIC}map.html?lat=${lat}&lng=${lng}&zoom=8`);
            // setting time
            setInterval(() => updateTime(geoTz.tz), 1000);
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [geoTz])

    useEffect(() => {
        if(accessState !== AccessState.Valid) return;
        const searchParams = new URLSearchParams(window.location.search);
        if (!searchParams.has("id")) {
            console.error("Request parameters must include user id");
            return;
        }
        localStore.dispatch(getGeoTzAction(searchParams.get("id")));
    }, [])

    useEffect(() => {
        if(accessState !== AccessState.Valid) return;

        if (src) {
            mapContainer.current?.contentWindow.location.replace(src);
        }
    }, [src])

    return (
        <div className="map-loader">
            <div className="map-sub-container">
                {!disabled  &&
                    <React.Fragment>
                        {
                            accessState === AccessState.Valid  ? 
                                (<>
                                    {tz?.timeFormatted && city &&
                                    <div className="timezone" title={`${city} - ${tz.timeFull}`}>
                                        <Clock/><span>{tz.timeFormatted}</span>
                                    </div>}
                                    <iframe scrolling="no" height="200" ref={mapContainer} src={src}></iframe>
                                </>) :
                                <div className="access-guard-map-wrapper">
                                    <AccessGuard setAccessState={setAccessState} className={"access-guard-px24"} loaderClassName={"loader-base loader-px24"} />
                                </div>
                        }
                    </React.Fragment>
                }
            </div>
        </div>
    );

};