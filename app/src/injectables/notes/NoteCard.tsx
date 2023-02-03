import {NoteExtended} from "../../global";
import React, {useEffect, useRef} from "react";
import "./NoteCard.scss";
import {StageLabels} from "./StageSwitch";
import {formatDate} from "../../services/UIHelpers";

type Props = {
    note: NoteExtended
    extended?: boolean
    onProfileSelect?: (profile: any) => void
    shouldScrollTo?: boolean
};

export const NoteCard: React.FC<Props> = ({note, extended, onProfileSelect, shouldScrollTo}) => {

    const getDotClass = () => StageLabels[note.stageTo].class;
    const ref = useRef<HTMLDivElement>();

    useEffect((() => {
        if (shouldScrollTo && ref.current) {
            ref.current.scrollIntoView({behavior: "smooth"});
        }
    }), []);

    const getDescription = () => {
        if (note.stageFrom !== undefined && note.stageTo !== undefined) {
            return " changed the status" + (extended ? " of" : "");
        } else {
            return " left a note" + (extended ? " on" : "");
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

    const setWithNote = () => onProfileSelect({
        profile: note.profile,
        profileName: note.profileName,
        profilePicture: note.profilePicture
    })

    return (
        <div className="note-card" ref={ref}>
            {!extended && note.stageTo >= 0 && <div className={"dot " + getDotClass()}/>}
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
                    <div className="header">
                        {extended ?
                            <div className="header-extended">
                                <div className="author">{note.authorName}</div>
                                <div>{getDescription()}</div>
                                <div className="author pointer" onClick={() => setWithNote()}>{note.profileName}</div>
                            </div>
                            : <div className="header-regular">
                                <span className="author">{note.authorName}</span>
                                <span> {getDescription()}</span>
                            </div>
                        }
                        <label className="timestamp">{formatDate(new Date(note.timestamp))}</label>
                    </div>
                    {note.stageFrom !== undefined && note.stageTo !== undefined &&
                    <div className="transition">
                        {getStage(note.stageFrom)}
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path opacity="0.2" d="M1 5H13M13 5L9.57143 1M13 5L9.57143 9" stroke="#909090"
                                  strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {getStage(note.stageTo)}
                    </div>}
                    {note.text && <div className="text">{note.text}</div>}
                </div>
            </div>
        </div>
    )

}