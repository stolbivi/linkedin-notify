import React from "react";
import {injectLastChild} from "../utils/InjectHelper";
// @ts-ignore
import stylesheet from "./TimeZone.scss";


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

export const TimeZone: React.FC<Props> = ({}) => {

    // const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    // const [show, setShow] = useState<boolean>(true);
    // const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);
    // const [completed, setCompleted] = useState<boolean>(false);


    return (
        <React.Fragment>
            {/*<style dangerouslySetInnerHTML={{__html: stylesheet}}/>*/}
            {/*<AccessGuard setAccessState={setAccessState}*/}
            {/*             className={"access-guard-px16 top-right-corner"}*/}
            {/*             loaderClassName="loader-base top-right-corner loader-px24"/>*/}
            {/*{accessState === AccessState.Valid && show &&*/}
            {/*    <div className="time-zone top-right-corner" ref={rootElement}>*/}
            {/*        <Loader show={!completed}/>*/}
            {/*        {completed &&*/}
            {/*            <React.Fragment>*/}
            {/*                {tz?.timeFormatted && city &&*/}
            {/*                <div className="timezone" title={`${city} - ${tz.timeFull}`}>*/}
            {/*                    <Clock/><span>{tz.timeFormatted}</span>*/}
            {/*                </div>}*/}
            {/*            </React.Fragment>}*/}
            {/*    </div>}*/}

            <div className="time-zone top-right-corner">
                <h1>Time here</h1>
            </div>
        </React.Fragment>
    );
}
