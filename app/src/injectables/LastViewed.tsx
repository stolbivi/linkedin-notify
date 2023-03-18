import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
import {injectLastChild} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";
import {Clock} from "../icons/Clock";
import {Loader} from "../components/Loader";
import {formatDateToday} from "../services/UIHelpers";

// @ts-ignore
import stylesheet from "./LastViewed.scss";
import {getLastViewed, setLastViewed as setLastViewedAction} from "../actions";

export const LastViewedFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const badgeWrap = document.getElementsByClassName("pv-top-card__badge-wrap");
        if (badgeWrap && badgeWrap.length > 0) {
            let parent = badgeWrap[0].parentElement.parentElement.parentElement;
            parent.style.position = "relative";
            injectLastChild(parent, "lnm-last-viewed",
                <LastViewed/>
            );
        }
    }
}

type Props = {};

export const LastViewed: React.FC<Props> = ({}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [show, setShow] = useState<boolean>(true);
    const [completed, setCompleted] = useState<boolean>(false);
    const [lastViewed, setLastViewed] = useState<Date>();

    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        messages.request(getLastViewed(extractIdFromUrl(window.location.href)))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                } else {
                    if (r?.response?.hide) {
                        setShow(false);
                    } else if (r?.response?.length > 0) {
                        setLastViewed(new Date(r?.response[0].updatedAt));
                    } else {
                        setLastViewed(new Date());
                    }
                }
            }).finally(() => setCompleted(true));
    }, []);

    useEffect(() => {
        if (lastViewed) {
            messages.request(setLastViewedAction(extractIdFromUrl(window.location.href)))
                .then((r) => {
                    if (r.error) {
                        console.error(r.error);
                    }
                }).finally(() => setCompleted(true));
        }
    }, [lastViewed]);

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState}
                         className={"access-guard-px16 top-right-corner"}
                         loaderClassName="loader-base top-right-corner loader-px24"/>
            {accessState === AccessState.Valid && show &&
                <div className="last-viewed top-right-corner">
                    <Loader show={!completed}/>
                    {completed &&
                        <React.Fragment>
                            <Clock/>
                            <label>Last viewed on:</label>
                            <span>{formatDateToday(lastViewed)}</span>
                        </React.Fragment>}
                </div>}
        </React.Fragment>
    );
}