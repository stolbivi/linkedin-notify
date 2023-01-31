import React, {useEffect, useState} from "react";
import {NotesContainer} from "./NotesContainer";
import {AppMessageType, IAppRequest, MESSAGE_ID, NoteExtended, VERBOSE} from "../../global";
import {Messages} from "@stolbivi/pirojok";
import {Loader} from "../../components/Loader";
import {NoteCard} from "./NoteCard";
import {injectFirstChild} from "../../utils/InjectHelper";

// @ts-ignore
import stylesheet from "./NotesManager.scss";

export const NotesManagerFactory = () => {
    const aside = document.getElementsByClassName("scaffold-layout__aside");
    if (aside && aside.length > 0) {
        injectFirstChild(aside[0], "lnm-notes-manager",
            <NotesManager/>
        );
    }
}

type Props = {};

export const NotesManager: React.FC<Props> = ({}) => {

    const MAX_LENGTH = 200;

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [show, setShow] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false);
    const [notes, setNotes] = useState<NoteExtended[]>([]);
    const [selection, setSelection] = useState<any>();
    const [selectedNotes, setSelectedNotes] = useState<NoteExtended[]>([]);
    const [editable, setEditable] = useState<boolean>(true);

    useEffect(() => {
        setShow(true);
        setCompleted(false);
        messages.request<IAppRequest, any>({
            type: AppMessageType.NotesAll,
        }, (r) => {
            if (r.error) {
                console.error(r.error);
                setShow(false)
            } else {
                setNotes(r.response);
                setCompleted(true);
            }
        }).then(/* nada */);
    }, [])

    useEffect(() => {
        if (selection) {
            console.log(selection);
            setCompleted(false);
            messages.request<IAppRequest, any>({
                type: AppMessageType.NotesByProfile,
                payload: selection.profile
            }, (r) => {
                if (r.error) {
                    console.error(r.error);
                } else {
                    setSelectedNotes(r.response);
                    setCompleted(true);
                }
            }).then(/* nada */);
        }
    }, [selection]);

    const onProfileSelect = (profile: any) => setSelection(profile);

    const getAllNotes = () => {
        return <React.Fragment>
            <div className="notes-title">
                <label>Notes</label>
                <label className="notes-counter">{notes ? notes.length : 0}</label>
            </div>
            <div className="notes-scroll">
                {notes?.map((n, i) =>
                    (<NoteCard key={i} note={n} extended={true} onProfileSelect={onProfileSelect}/>))}
                {notes.length == 0 && <div className="no-notes">No notes yet</div>}
            </div>
        </React.Fragment>
    }

    const appendNote = (note: NoteExtended) => {
        setSelectedNotes([...notes, note]);
    }

    const back = () => {
        setSelection(undefined);
        setSelectedNotes([]);
    }

    const onKeyUp = (e: any) => {
        if (e.code === 'Enter') {
            let text = e.target.value?.trim();
            if (text && text !== "") {
                text = text.slice(0, MAX_LENGTH);
                setEditable(false);
                const lastState = selectedNotes[selectedNotes.length - 1].stageTo;
                messages.request<IAppRequest, any>({
                    type: AppMessageType.Note,
                    payload: {id: selection.profile, stageTo: lastState, text}
                }, (r) => {
                    if (r.error) {
                        console.error(r.error);
                    } else {
                        e.target.value = "";
                        appendNote(r.note.response)
                    }
                    setEditable(true);
                }).then(/* nada */);
            }
        }
    }

    const getSelectedNotes = () => {
        return <React.Fragment>
            <div className="notes-header">
                <div className="back-button" onClick={() => back()}>
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.2" d="M7 1L1 7L7 13" stroke="#666666" strokeWidth="2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </div>
                <img src={selection.profilePicture}/>
                <div className="name">{selection.profileName}</div>
            </div>
            <div className="notes-title">
                <label>Notes</label>
                <label className="notes-counter">{selectedNotes ? selectedNotes.length : 0}</label>
            </div>
            <div className="notes-scroll">
                {selectedNotes?.map((n, i) =>
                    (<NoteCard key={i} note={n}/>))}
                {selectedNotes.length == 0 && <div className="no-notes">No notes yet</div>}
            </div>
            <div className="footer-child">
                <input type="text" onKeyUp={onKeyUp} disabled={!editable} className="text-input"
                       placeholder="Leave a note"/>
            </div>
        </React.Fragment>
    }

    return (
        <React.Fragment>
            {show &&
            <React.Fragment>
                <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
                <div className="notes-manager">
                    <NotesContainer>
                        {completed ?
                            (selection == undefined ? getAllNotes() : getSelectedNotes())
                            : <div className="centered-loader"><Loader show={!completed}/></div>}
                    </NotesContainer>
                </div>
            </React.Fragment>}
        </React.Fragment>
    );

}