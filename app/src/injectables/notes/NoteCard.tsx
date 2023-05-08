import {NoteExtended} from "../../global";
import React from "react";
import "./NoteCard.scss";
import {StageLabels} from "./StageSwitch";
import {formatDate} from "../../services/UIHelpers";

type Props = {
    note: NoteExtended
    extended?: boolean
    onProfileSelect?: (profile: any) => void
    lastNoteRef?: any
    currentCount?:number
    totalCount?:number
    fromListView?:boolean
};

export const NoteCard: React.FC<Props> = ({note, extended, onProfileSelect, currentCount, totalCount, lastNoteRef, fromListView}) => {

    const getAuthor = () => note.authorName;

    const getDescription = () => {
        if (note.stageFrom !== undefined && note.stageTo !== undefined) {
            return " changed the status" + (extended ? " of" : "");
        } else {
            return " left a note" + (extended ? " on" : "");
        }
    }

    const getStage = (stage: number) => {
        if (stage < 0) {
            return (
                <div className={"stage inactive"}>
                    <label>No stage</label>
                </div>
            );
        }
        const stageLabel = StageLabels[stage]?.label;
        const truncatedLabel =
            stageLabel && stageLabel?.length > 30
                ? `${stageLabel?.slice(0, 27)}...`
                : stageLabel;
        return (
            <div
                className={`stage ${
                    StageLabels[stage] ? StageLabels[stage]?.class : "interested"
                } ${stageLabel?.length < 11 ? "stage-notecard" : ""}`}
            >
            <label title={stageLabel}>{truncatedLabel}</label>
            </div>
        );
    };


    const setWithNote = () => {
        onProfileSelect({
            profile: note.profile,
            profileName: note.profileName,
            profilePicture: note.profilePicture,
            profileLink: note.profileLink
        })
    }

    return (
        <div className="note-card" ref={currentCount === totalCount - 1 ? lastNoteRef : null}>
            <div className="bordered">
                <div className="picture">
                    {extended ?
                        <div className="picture-extended pointer" onClick={() => setWithNote()}>
                            <img src={note.authorPicture}/>
                            <img className="img-over" src={note.profilePicture}/>
                        </div>
                        : <img src={note.authorPicture}/>}
                </div>
                <div className="details">
                    <div className={`header ${fromListView ? 'note-card-listview' : ''}`}>
                        {extended ?
                            <div className="header-regular">
                                <div className="author">{getAuthor()}</div>
                                <div>{getDescription()}</div>
                                <div className="author pointer" onClick={() => setWithNote()}>{note.profileName}</div>
                            </div>
                            : <div className="header-regular">
                                <div className="author">{getAuthor()}</div>
                                <div> {getDescription()}</div>
                            </div>
                        }
                        <label className="timestamp">{formatDate(new Date(note.timestamp))}</label>
                    </div>
                    {note.stageFrom !== undefined && note.stageTo !== undefined &&
                    <div className="transition">
                        {getStage(note.stageTo)}
                    </div>}
                    {note.text && <div className={`text ${fromListView ? 'text-listview' : ''}`}>{note.text}</div>}
                </div>
            </div>
        </div>
    )

}
