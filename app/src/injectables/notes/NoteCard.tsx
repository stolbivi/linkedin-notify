import {NoteExtended} from "../../global";
import React from "react";
import "./NoteCard.scss";
import {StageLabels} from "./StageSwitch";
import {formatDate} from "../../services/UIHelpers";

type Props = {
    note: NoteExtended
};

export const NoteCard: React.FC<Props> = ({note}) => {

    const getDotClass = () => StageLabels[note.stageTo].class;

    const getDescription = () => {
        if (note.stageFrom !== undefined && note.stageTo !== undefined) {
            return " changed the status";
        } else {
            return " left a note";
        }
    }

    const getStage = (stage: number) => {
        if (stage < 0) {
            return <div className={"stage inactive"}><label>No stage</label></div>
        }
        return <div className={"stage " + StageLabels[stage].class}>
            <label>{StageLabels[stage].label}</label>
        </div>
    }

    return (
        <div className="note-card">
            <div className="picture">
                <div className={"dot " + getDotClass()}/>
                <img src={note.authorPicture}/>
            </div>
            <div className="details">
                <div className="header">
                    <span><span className="author">{note.authorName}</span>{getDescription()}</span>
                    <label className="timestamp">{formatDate(new Date(note.timestamp))}</label>
                </div>
                {note.stageFrom !== undefined && note.stageTo !== undefined &&
                <div className="transition">
                    {getStage(note.stageFrom)}
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.2" d="M1 5H13M13 5L9.57143 1M13 5L9.57143 9" stroke="#909090" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {getStage(note.stageTo)}
                </div>}
                {note.text && <div className="text">{note.text}</div>}
            </div>
        </div>
    )

}