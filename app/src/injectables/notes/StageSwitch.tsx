import React from "react";
import {Loader} from "../../components/Loader";
import {CompleteEnabled, localStore, selectStage} from "../../store/LocalStore";
import {Stage, updateStageAction} from "../../store/StageReducer";
import {shallowEqual, useSelector} from "react-redux";
import "./StageSwitch.scss";

export enum StageEnum {
    Interested,
    NotInterested,
    Interviewing,
    FailedInterview,
    Hired
}

export const StageLabels = {
    0: {label: "Interested", class: "interested"},
    1: {label: "Not interested", class: "not-interested"},
    2: {label: "Interviewing", class: "interviewing"},
    3: {label: "Failed interview", class: "failed"},
    4: {label: "Hired", class: "hired"}
} as { [key: number]: any }
StageLabels[-1] = {label: "Add Status", class: "inactive"};

type Props = {
    type: StageEnum
    id: string
    urn: string
};

export const StageSwitch: React.FC<Props> = ({type, id, urn}) => {

    const stage: CompleteEnabled<Stage> = useSelector(selectStage, shallowEqual)[id];

    const onClick = () => {
        if (stage?.stage !== type) {
            localStore.dispatch(updateStageAction({id, state: {id: urn, stage: type, stageFrom: stage?.stage}}));
        }
    }

    return (
        <React.Fragment>
            <div className={"stage " + (stage?.stage === type ? StageLabels[type].class : "inactive")}
                 onClick={onClick}>
                <div className="loader"><Loader show={!stage?.completed || stage?.stage === undefined}/></div>
                <label style={{opacity: stage?.completed ? 1 : 0}}>{StageLabels[type].label}</label>
            </div>
        </React.Fragment>
    );
}