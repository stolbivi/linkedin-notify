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
    Hired,
    Not_Looking_Currently,
    Open_To_New_Offers,
    Passive_Candidate,
    Actively_Looking,
    Future_Interest,
    Relocation,
    Commute,
    Hybrid,
    Remote,
    Contacted,
    Pending_Response,
    Interview_Scheduled,
    Offer_Extended,
    Rejected,
    Part_Time,
    Full_Time,
    Permanent,
    Contract,
    Freelance
}

export const StageLabels = {
    0: {label: "Interested", class: "interested"},
    1: {label: "Not interested", class: "not-interested"},
    2: {label: "Interviewing", class: "interviewing"},
    3: {label: "Failed interview", class: "failed"},
    4: {label: "Hired", class: "hired"},
    5: { label: "Not Looking Currently", class: "passive" },
    6: { label: "Open to New Offers", class: "hired" },
    7: { label: "Passive Candidate", class: "passive" },
    8: { label: "Actively Looking", class: "interviewing" },
    9: { label: "Future Interest", class: "interested" },
    10: { label: "Relocation", class: "interested" },
    11: { label: "Commute", class: "interested" },
    12: { label: "Hybrid", class: "interested" },
    13: { label: "Remote", class: "interested" },
    14: { label: "Contacted", class: "interviewing" },
    15: { label: "Pending Response", class: "interested" },
    16: { label: "Interview Scheduled", class: "interviewing" },
    17: { label: "Offer Extended", class: "hired" },
    18: { label: "Rejected", class: "failed" },
    19: { label: "Part-Time", class: "interested" },
    20: { label: "Full-Time", class: "interested" },
    21: { label: "Permanent", class: "interested" },
    22: { label: "Contract", class: "interested" },
    23: { label: "Freelance", class: "interested" }

} as { [key: number]: any }
StageLabels[-1] = {label: "Add Status", class: "inactive"};

type Props = {
    type: StageEnum
    id: string;
    urn: string
    customText?: string;
    parentStage?: number
};

export const StageSwitch: React.FC<Props> = ({type, id, urn, customText, parentStage}) => {

    const stage: CompleteEnabled<Stage> = useSelector(selectStage, shallowEqual)[id];

    const onClick = () => {
        if (stage?.stage !== type) {
            localStore.dispatch(updateStageAction({id, state: {id: urn, stage: type, stageFrom: stage?.stage, stageText: customText || undefined, parentStage }}));
        }
    }

    return (
        <React.Fragment>
            <div className={"stage inactive"} onClick={onClick}>
                <div className="loader"><Loader show={!stage?.completed}/></div>
                <label style={{opacity: stage?.completed ? 1 : 0}}>{customText || StageLabels[type].label}</label>
            </div>
        </React.Fragment>
    );
}