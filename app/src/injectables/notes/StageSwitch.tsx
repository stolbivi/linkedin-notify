import React, {useEffect, useState} from "react";
import {Loader} from "../../components/Loader";
import {MessagesV2} from "@stolbivi/pirojok";
import {Note, NoteExtended, VERBOSE} from "../../global";
import {deleteNote, deleteStage, setStage as setStageAction} from "../../actions";
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

export enum StageParentData {
    AVAILABILITY = "Availability",
    STATUS = "Status",
    TYPE = "Type",
    GEOGRAPHY = "Geography",
    GROUPS = "Groups"
}

export const stageParentsData = [
    {name: StageParentData.AVAILABILITY},
    {name: StageParentData.STATUS},
    {name: StageParentData.TYPE},
    {name: StageParentData.GEOGRAPHY},
    {name: StageParentData.GROUPS}
]

export const stageChildData = {
    [StageParentData.AVAILABILITY]: [
        {name: StageEnum.Passive_Candidate},
        {name: StageEnum.Actively_Looking},
        {name: StageEnum.Open_To_New_Offers},
        {name: StageEnum.Not_Looking_Currently},
        {name: StageEnum.Future_Interest}
    ],
    [StageParentData.GEOGRAPHY]: [
        {name: StageEnum.Relocation},
        {name: StageEnum.Commute},
        {name: StageEnum.Hybrid},
        {name: StageEnum.Remote}
    ],
    [StageParentData.STATUS]: [
        {name: StageEnum.Contacted},
        {name: StageEnum.Pending_Response},
        {name: StageEnum.Interview_Scheduled},
        {name: StageEnum.Offer_Extended},
        {name: StageEnum.Hired},
        {name: StageEnum.Rejected}
    ],
    [StageParentData.TYPE]: [
        {name: StageEnum.Part_Time},
        {name: StageEnum.Full_Time},
        {name: StageEnum.Permanent},
        {name: StageEnum.Contract},
        {name: StageEnum.Freelance}
    ],
    [StageParentData.GROUPS]: [
        {name: StageEnum.Commute}
    ]
}


type Props = {
    type?: StageEnum
    activeStage?: StageEnum
    setStage?: (s: StageEnum) => void
    appendNote?: (n: Note, tagToRemoveIndex: number) => void
    id?: string;
    classType?: string;
    customText?: string;
    notes?: NoteExtended[];
    parentStage?: number;
    parentStageName?: string;
    setNotes: any;
};

export const StageSwitch: React.FC<Props> = ({type, activeStage, setStage, id, appendNote, customText,
                                                 notes, parentStage,parentStageName, setNotes}) => {

    const [completed, setCompleted] = useState<boolean>(false);
    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        if (activeStage !== undefined) {
            setCompleted(true);
        }
    }, [activeStage])

    const onClick = () => {
        if (activeStage === type || notes.find(note => note.stageTo === type)) {
            return;
        }
        const existingChildStage = notes.find(note => note.parentStage === parentStage);
        let tagToRemoveIndex: number;
        if(existingChildStage && parentStageName !== StageParentData.GEOGRAPHY && parentStageName !== StageParentData.GROUPS) {
            let updatedNotes = [...notes];
            tagToRemoveIndex = updatedNotes.findIndex(tag => tag.id === existingChildStage.id);
            if (tagToRemoveIndex !== -1) {
                updatedNotes.splice(tagToRemoveIndex, 1);
                setNotes(updatedNotes);
            }
            messages.request(deleteNote(existingChildStage.id)).then((_r) => {});
            messages.request(deleteStage(existingChildStage.id)).then((_r) => {});
        }
        setCompleted(false);
        messages.request(setStageAction({id, stage: type, stageFrom: activeStage, stageText: customText || undefined, parentStage }))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                } else {
                    setStage(r.stage.response.stage);
                    appendNote(r.note.response, tagToRemoveIndex);
                }
                setCompleted(true);
            });
    }

    return (
        <React.Fragment>
            <div className={"stage inactive"} onClick={onClick}>
                <div className="loader"><Loader show={!completed || activeStage === undefined}/></div>
                <label style={{opacity: completed ? 1 : 0}}>{customText || StageLabels[type].label}</label>
            </div>
        </React.Fragment>
    );
}
