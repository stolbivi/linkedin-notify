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
    Not_Open,
    Open,
    Passive,
    Active,
    Future,
    Relocation,
    Commute,
    Hybrid,
    Remote,
    Contacted,
    Pending,
    Interview,
    Offer,
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
    5: { label: "Not Open", class: "passive" },
    6: { label: "Open", class: "hired" },
    7: { label: "Passive", class: "passive" },
    8: { label: "Active", class: "interviewing" },
    9: { label: "Future", class: "interested" },
    10: { label: "Relocation", class: "interested" },
    11: { label: "Commute", class: "interested" },
    12: { label: "Hybrid", class: "interested" },
    13: { label: "Remote", class: "interested" },
    14: { label: "Contacted", class: "interviewing" },
    15: { label: "Pending", class: "interested" },
    16: { label: "Interview", class: "interviewing" },
    17: { label: "Offer", class: "hired" },
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
        {name: StageEnum.Passive},
        {name: StageEnum.Active},
        {name: StageEnum.Open},
        {name: StageEnum.Not_Open},
        {name: StageEnum.Future}
    ],
    [StageParentData.GEOGRAPHY]: [
        {name: StageEnum.Relocation},
        {name: StageEnum.Commute},
        {name: StageEnum.Hybrid},
        {name: StageEnum.Remote}
    ],
    [StageParentData.STATUS]: [
        {name: StageEnum.Contacted},
        {name: StageEnum.Pending},
        {name: StageEnum.Interview},
        {name: StageEnum.Offer},
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
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        if (activeStage !== undefined) {
            setCompleted(true);
        }
        setIsSelected(Boolean(notes.find(note => note.stageTo === type)));
    }, [activeStage,notes])

    const removeSelectedTag = (id: string, tagToRemoveIndex: number, updatedNotes: any) => {
        setCompleted(false);
        const deleteNotePromise = messages.request(deleteNote(id)).then((_r) => {});
        const deleteStagePromise = messages.request(deleteStage(id)).then((_r) => {});
        if (tagToRemoveIndex !== -1) {
            updatedNotes.splice(tagToRemoveIndex, 1);
            setNotes(updatedNotes);
        }
        Promise.all([deleteNotePromise,deleteStagePromise]).then(()=>{
            setCompleted(true);
        })
    };

    const onClick = () => {
        const selectedNote = notes.find(note => note.stageTo === type);
        let tagToRemoveIndex: number;
        if (selectedNote && isSelected) {
            let updatedNotes = [...notes];
            tagToRemoveIndex = updatedNotes.findIndex(tag => tag.id === selectedNote.id);
            removeSelectedTag(selectedNote.id, tagToRemoveIndex, updatedNotes);
            return;
        }
        setCompleted(false);
        messages.request(setStageAction({id, stage: type, stageFrom: activeStage, stageText: customText || undefined, parentStage }))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                } else {
                    const existingChildStage = notes.find(note => note.parentStage === parentStage);
                    if(existingChildStage && parentStageName !== StageParentData.GEOGRAPHY
                        && parentStageName !== StageParentData.GROUPS && existingChildStage !== r.stage.response.stage) {
                        let updatedNotes = [...notes];
                        tagToRemoveIndex = updatedNotes.findIndex(tag => tag.id === existingChildStage.id);
                        if (tagToRemoveIndex !== -1) {
                            updatedNotes.splice(tagToRemoveIndex, 1);
                            setNotes(updatedNotes);
                        }
                    }
                    setStage(r.stage.response.stage);
                    appendNote(r.note.response, tagToRemoveIndex);
                }
                setCompleted(true);
            });
    }

    return (
        <React.Fragment>
            <div className={`stage ${(isSelected && StageLabels[type]) ? StageLabels[type].class : "inactive"}`} onClick={onClick}>
                <div className="loader"><Loader show={!completed || activeStage === undefined}/></div>
                <label style={{opacity: completed ? 1 : 0}}>{customText || StageLabels[type].label}</label>
            </div>
        </React.Fragment>
    );
}
