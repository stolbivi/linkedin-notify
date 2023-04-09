import React, {useEffect, useState} from "react";
import {Loader} from "../../components/Loader";
import {MessagesV2} from "@stolbivi/pirojok";
import {Note, VERBOSE} from "../../global";
import {setStage as setStageAction} from "../../actions";
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
    5: { label: "Not Looking Currently", class: "inactive" },
    6: { label: "Open to New Offers", class: "hired" },
    7: { label: "Passive Candidate", class: "inactive" },
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
    type?: StageEnum
    activeStage?: StageEnum
    setStage?: (s: StageEnum) => void
    appendNote?: (n: Note) => void
    id?: string;
    classType?: string;
    customText?: string;
};

export const StageSwitch: React.FC<Props> = ({type, activeStage, setStage, id, appendNote, classType, customText}) => {

    const [completed, setCompleted] = useState<boolean>(false);

    const messages = new MessagesV2(VERBOSE);

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
        messages.request(setStageAction({id, stage: type, stageFrom: activeStage, stageText: customText || undefined}))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                } else {
                    setStage(r.stage.response.stage);
                    appendNote(r.note.response)
                }
                setCompleted(true);
            });
    }

    return (
        <React.Fragment>
            <div className={"stage " + (classType || (StageLabels[type].class || "inactive"))} onClick={onClick}>
                <div className="loader"><Loader show={!completed || activeStage === undefined}/></div>
                <label style={{opacity: completed ? 1 : 0}}>{customText || StageLabels[type].label}</label>
            </div>
        </React.Fragment>
    );
}