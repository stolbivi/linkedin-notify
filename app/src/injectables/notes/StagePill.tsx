import React, {useEffect, useState} from "react";
import {extractIdFromUrl} from "../../global";
import {StageLabels} from "./StageSwitch";
import {injectLastChild} from "../../utils/InjectHelper";
import {Loader} from "../../components/Loader";
import {AccessGuard, AccessState} from "../AccessGuard";
import {CompleteEnabled, localStore, selectStage} from "../../store/LocalStore";
import {Provider, shallowEqual, useSelector} from "react-redux";
import {showNotesAndChartsAction} from "../../store/ShowNotesAndCharts";

// @ts-ignore
import stylesheet from "./StageSwitch.scss";
import {getStageAction, Stage} from "../../store/StageReducer";

export const StagePillFactory = () => {
    // individual profile
    if (window.location.href.indexOf("/in/") > 0) {
        const headerContainer = document.getElementsByClassName("pv-text-details__left-panel");
        if (headerContainer && headerContainer.length > 0) {
            const header = headerContainer[0].getElementsByTagName("h1");
            if (header && header.length > 0) {
                header[0].parentElement.style.display = "flex";
                header[0].style.paddingRight = "0.5em";
                injectLastChild(header[0].parentElement, "lnm-stage",
                    <Provider store={localStore}>
                        <StagePill id={extractIdFromUrl(window.location.href)}/>
                    </Provider>
                );
            }
        }
    }
}

type Props = {
    id: string
};

export const StagePill: React.FC<Props> = ({id}) => {

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const stage: CompleteEnabled<Stage> = useSelector(selectStage, shallowEqual)[id];

    useEffect(() => {
        if (accessState !== AccessState.Valid || !id) {
            return;
        }
        localStore.dispatch(getStageAction({id, state: {url: id}}));

    }, [accessState]);

    const onClick = () => {
        if (showNotes) {
            setShowNotes(false);
        } else {
            localStore.dispatch(showNotesAndChartsAction({
                id: extractIdFromUrl(window.location.href),
                state: {showSalary: false, showNotes: true, show: true}
            }));
        }
    }

    const getStage = () => stage?.stage > 0 ? stage?.stage : -1;

    const getText = () => stage?.completed ? StageLabels[getStage()].label : "Loading"

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16"}
                         loaderClassName="loader-base loader-px24"/>
            {accessState === AccessState.Valid &&
                <div className={"stage " + StageLabels[getStage()].class} onClick={onClick} style={{marginLeft: "1em"}}>
                    <div className="loader"><Loader show={!stage?.completed}/></div>
                    <label style={{opacity: stage?.completed ? 1 : 0}}>{getText()}</label>
                </div>}
        </React.Fragment>
    );
}