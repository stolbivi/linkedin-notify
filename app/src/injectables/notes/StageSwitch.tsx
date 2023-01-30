import React, {useEffect, useState} from "react";
import {Loader} from "../../components/Loader";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, MESSAGE_ID, Note, VERBOSE} from "../../global";
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

type Props = {
    type: StageEnum
    activeStage: StageEnum
    setStage: (s: StageEnum) => void
    appendNote: (n: Note) => void
    id: string
};

export const StageSwitch: React.FC<Props> = ({type, activeStage, setStage, id, appendNote}) => {

    const [completed, setCompleted] = useState<boolean>(false);

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    useEffect(() => {
        if (activeStage !== undefined) {
            setCompleted(true);
        }
    }, [activeStage])

    const onClick = () => {
        if (activeStage === type) {
            return;
        }
        setCompleted(false);
        messages.request<IAppRequest, any>({
            type: AppMessageType.SetStage,
            payload: {id, stage: type, stageFrom: activeStage}
        }, (r) => {
            if (r.error) {
                console.error(r.error);
            } else {
                setStage(r.stage.response.stage);
                appendNote(r.note.response)
            }
            setCompleted(true);
        }).then(/* nada */);
    }

    return (
        <React.Fragment>
            <div className={"stage " + (activeStage === type ? StageLabels[type].class : "inactive")} onClick={onClick}>
                <div className="loader"><Loader show={!completed || activeStage === undefined}/></div>
                <label style={{opacity: completed ? 1 : 0}}>{StageLabels[type].label}</label>
            </div>
        </React.Fragment>
    );
}