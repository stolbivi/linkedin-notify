import React, {useEffect, useRef, useState} from "react";
import {Loader} from "../../components/Loader";
import {CompleteEnabled, localStore, selectStage} from "../../store/LocalStore";
import {Stage, updateStageAction} from "../../store/StageReducer";
import {shallowEqual, useSelector} from "react-redux";
import {extractIdFromUrl, Note, NoteExtended} from "../../global";
import "./StageSwitch.scss";
import {deleteNoteAction} from "../../store/NotesAllReducer";
import { useAppDispatch, useAppSelector } from "../dashboard/Kanban/hooks/useRedux";
import { removeCard } from "../../store/kanban.slice";
import { SetStagePayload } from "../../actions";
import generateUUID from "../../utils/UuidHelper";

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
    setNotes?: any;
    urn: string
    allGroupsMode?: any;
    card?: any;
    stageChildData?: any;
    stageParent?: any;
};

export const StageSwitch: React.FC<Props> = ({type, activeStage, urn, id,
                                                 customText, parentStage, notes,allGroupsMode, card, stageChildData, stageParent}) => {

    const [hovered, setHovered] = useState(false);
    const stagePillRef = useRef();
    const stage: CompleteEnabled<Stage> = useSelector(selectStage, shallowEqual)[id];
    const [isSelected, setIsSelected] = useState(false);
    const [completed, setCompleted] = useState<boolean>(false);
    const {kanbanData} = useAppSelector(state => state.kanbanData);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (activeStage !== undefined) {
            setCompleted(true);
        }
        setIsSelected(Boolean(notes.find(note => {
            if(note.stageText && customText && note.stageText === customText) {
                return true
            }
            else if(!customText && note.stageTo === type) {
                return true
            }

            return false

        } )));
    }, [activeStage,notes]);

    const removeSelectedTag = (id: string) => {
        setCompleted(false)
        localStore.dispatch(deleteNoteAction({id, url: extractIdFromUrl(window.location.href)}))
        setTimeout(() => setCompleted(true), 3000);
    };

    const onClick = () => {
        const label = StageLabels[type].label
        console.log({stage, type, activeStage, isSelected, notes, card, stageChildData, stageParent, label: StageLabels[type].label, kanbanData})
        if(!stage?.completed && !customText) {
            return;
        }
        setCompleted(false);
        const selectedNote = notes.find(note => (note.stageText && customText && note.stageText === customText) || (!customText && note.stageTo === type) || null );
        if (selectedNote && isSelected) {
            removeSelectedTag(selectedNote.id);
            dispatch(removeCard({parent: stageParent.name.toUpperCase(), label: label.replaceAll("-", "_"), userId: card.userId}))
            setTimeout(() => {
                setCompleted(true);
            }, 3000);
            return;
        }
        const existingChildStage = notes.find(note => note.parentStage === parentStage);
        try {
            const stageObj: {id:string, state: SetStagePayload} = {
                id,
                state: {
                    id: urn, stage: type, stageFrom: activeStage, stageText: customText || undefined, parentStage, existingChildStageId: existingChildStage?.id,
                    parent: stageParent?.name?.toUpperCase(), label: label?.replaceAll("-", "_"), userId: card?.userId,
                },
            }
            if(card) {
                stageObj.state.card= {
                    ...card, status: label, category: StageLabels[type].label.replaceAll("-", " "), id: generateUUID()
                }
                stageObj.state.action=['GEOGRAPHY', 'GROUPS'].includes(stageParent?.name?.toUpperCase())  ? 'add' : 'update'
            }
            localStore.dispatch(updateStageAction(stageObj));
        } catch (error) {
            console.log('error', error)
        }
        setTimeout(() => setCompleted(true), 6000);
        if (isSelected) {
            // @ts-ignore
            stagePillRef?.current?.classList.remove(StageLabels[type]?.class);
            // @ts-ignore
            stagePillRef?.current?.classList.add('inactive');
        }
    }

    return (
        <React.Fragment>
            <div ref={stagePillRef} className={`pill-parent stage ${((isSelected && StageLabels[type]) || (hovered && (stage?.completed || customText))) ? StageLabels[type]?.class : "inactive"} ${customText ? "customPill" : ''} ${allGroupsMode ? 'note-card-fit' : ''}`}
                 onClick={onClick}
                 onMouseEnter={() => {
                     if(!isSelected) {
                         setHovered(true);
                     }
                     setTimeout(() => {
                        setHovered(false);
                     },10000);
                 }}
                 onMouseLeave={() => setHovered(false)}>
                <div className="loader"><Loader show={!completed || activeStage === undefined}/></div>
                <label className={customText && customText.length > 12 ? 'ellipsis' : ''} style={{opacity: completed ? 1 : 0}}>
                    {customText || StageLabels[type].label}
                </label>
            </div>
        </React.Fragment>
    );
}
