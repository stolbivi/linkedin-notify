import React, {useEffect, useState} from "react";
import {extractIdFromUrl} from "../global";
import {injectLastChild} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";
import {Clock} from "../icons/Clock";
import {Loader} from "../components/Loader";
import {formatDateToday} from "../services/UIHelpers";
import {Provider, shallowEqual, useSelector} from "react-redux";
import {CompleteEnabled, localStore, selectLastViewed} from "../store/LocalStore";
import {getLastViewedAction, LastViewed as LastViewedData} from "../store/LastViewedReducer";

// @ts-ignore
import stylesheet from "./LastViewed.scss";

export const LastViewedFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const badgeWrap = document.getElementsByClassName("pv-top-card__badge-wrap");
        if (badgeWrap && badgeWrap.length > 0) {
            let parent = badgeWrap[0].parentElement.parentElement.parentElement;
            parent.style.position = "relative";
            injectLastChild(parent, "lnm-last-viewed",
                <Provider store={localStore}>
                    <LastViewed/>
                </Provider>
            );
        }
    }
}

type Props = {};

export const LastViewed: React.FC<Props> = ({}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const lastViewed: CompleteEnabled<LastViewedData> = useSelector(selectLastViewed, shallowEqual);

    useEffect(() => {
        localStore.dispatch(getLastViewedAction(extractIdFromUrl(window.location.href)));
    }, []);

    const canShow = () => !lastViewed.hide;

    const getLastViewedValue = (lastViewed: CompleteEnabled<LastViewedData>) => {
        if (lastViewed.updatedAt) {
            return new Date(lastViewed.updatedAt);
        } else {
            return new Date();
        }
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState}
                         className={"access-guard-px16 top-right-corner"}
                         loaderClassName="loader-base top-right-corner loader-px24"/>
            {accessState === AccessState.Valid && canShow() &&
                <div className="last-viewed top-right-corner">
                    <Loader show={!lastViewed.completed}/>
                    {lastViewed.completed &&
                        <React.Fragment>
                            <Clock/>
                            <label>Last viewed on:</label>
                            <span>{formatDateToday(getLastViewedValue(lastViewed))}</span>
                        </React.Fragment>}
                </div>}
        </React.Fragment>
    );
}