import React, {useEffect, useState} from "react";
import {NotesContainer} from "./NotesContainer";
import {AppMessageType, IAppRequest, MESSAGE_ID, NoteExtended, VERBOSE} from "../../global";
import {Messages} from "@stolbivi/pirojok";
import {Loader} from "../../components/Loader";
import {NoteCard} from "./NoteCard";
import {injectFirstChild} from "../../utils/InjectHelper";
import {StageButton} from "./StageButton";
import {StageEnum} from "./StageSwitch";

// @ts-ignore
import stylesheet from "./NotesManager.scss";
import {AccessGuard, AccessState} from "../AccessGuard";
import {Credits} from "../Credits";

export const NotesManagerFactory = () => {
    const aside = document.getElementsByClassName("scaffold-layout__aside");
    if (aside && aside.length > 0) {
        injectFirstChild(aside[0], "lnm-notes-manager",
            <NotesManager/>
        );
    }
}

type Props = {};

interface SearchValue {
    text: string
    stages: { [key: number]: boolean }
}

export const NotesManager: React.FC<Props> = ({}) => {

    const MAX_LENGTH = 200;
    const DEFAULT_SEARCH = {text: "", stages: {}};

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [completed, setCompleted] = useState<boolean>(false);
    const [notes, setNotes] = useState<NoteExtended[]>([]);
    const [notesFiltered, setNotesFiltered] = useState<NoteExtended[]>([]);
    const [selection, setSelection] = useState<any>();
    const [selectedNotes, setSelectedNotes] = useState<NoteExtended[]>([]);
    const [selectedNotesFiltered, setSelectedNotesFiltered] = useState<NoteExtended[]>([]);
    const [editable, setEditable] = useState<boolean>(true);
    const [searchValue, setSearchValue] = useState<SearchValue>(DEFAULT_SEARCH);
    const [searchText, setSearchText] = useState<string>("");
    const [showDropDown, setShowDropDown] = useState<boolean>(false);

    useEffect(() => {
        if (accessState !== AccessState.Valid) {
            return;
        }
        setCompleted(false);
        messages.request<IAppRequest, any>({
            type: AppMessageType.NotesAll
        }, (r) => {
            if (r.error) {
                console.error(r.error);
            } else {
                setNotes(r.response);
                setNotesFiltered(r.response);
            }
        }).finally(() => setCompleted(true));
    }, [accessState]);

    const checkByText = (n: NoteExtended, text: string) => {
        if (text && text.length > 1) {
            return n.profileName.indexOf(text) >= 0
                || n.authorName.indexOf(text) >= 0
                || n.text?.indexOf(text) >= 0
        } else {
            return true;
        }
    }

    useEffect(() => {
        const stagesCount = Object.values(searchValue.stages).filter(v => v).length;
        let filteredNotes = notes.filter(
            n => checkByText(n, searchValue.text) &&
                (stagesCount > 0 ? (searchValue.stages[n.stageFrom] || searchValue.stages[n.stageTo]) : true)
        );
        setNotesFiltered(filteredNotes);
    }, [searchValue, notes]);

    useEffect(() => {
        setSearchValue(DEFAULT_SEARCH);
        if (selection) {
            // console.log(selection);
            setCompleted(false);
            messages.request<IAppRequest, any>({
                type: AppMessageType.NotesByProfile,
                payload: selection.profile
            }, (r) => {
                if (r.error) {
                    console.error(r.error);
                } else {
                    setSelectedNotes(r.response);
                    setSelectedNotesFiltered(r.response);
                    setCompleted(true);
                }
            }).then(/* nada */);
        }
    }, [selection]);

    const onProfileSelect = (profile: any) => setSelection(profile);

    const updateSearchValueWithText = (e: any) =>
        setSearchValue({...searchValue, text: e.target.value?.trim()});

    const onStageSelected = (type: StageEnum, selected: boolean) =>
        setSearchValue({...searchValue, stages: {...searchValue.stages, [type]: selected}});

    const getFilterCount = () => {
        const values = Object.values(searchValue.stages).filter(v => v);
        return values?.length > 0 && values?.length < 5 ? values.length : 'All';
    }

    const getAllNotes = () => {
        return <React.Fragment>
            <div className="notes-title">
                <label>Notes</label>
                <label className="notes-counter">{notesFiltered ? notesFiltered.length : 0}</label>
            </div>
            <div className="search-bar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6.70835 12.6876C3.41252 12.6876 0.729187 10.0042 0.729187 6.70841C0.729187 3.41258 3.41252 0.729248 6.70835 0.729248C10.0042 0.729248 12.6875 3.41258 12.6875 6.70841C12.6875 10.0042 10.0042 12.6876 6.70835 12.6876ZM6.70835 1.60425C3.89085 1.60425 1.60419 3.89675 1.60419 6.70841C1.60419 9.52008 3.89085 11.8126 6.70835 11.8126C9.52585 11.8126 11.8125 9.52008 11.8125 6.70841C11.8125 3.89675 9.52585 1.60425 6.70835 1.60425Z"
                        fill="#909090"/>
                    <path
                        d="M12.8334 13.2709C12.7225 13.2709 12.6117 13.2301 12.5242 13.1426L11.3575 11.9759C11.1884 11.8068 11.1884 11.5268 11.3575 11.3576C11.5267 11.1884 11.8067 11.1884 11.9759 11.3576L13.1425 12.5243C13.3117 12.6934 13.3117 12.9734 13.1425 13.1426C13.055 13.2301 12.9442 13.2709 12.8334 13.2709Z"
                        fill="#909090"/>
                </svg>
                <input type="text" onKeyUp={updateSearchValueWithText} placeholder="Filter"/>
                <div className="search-dropdown" onClick={() => setShowDropDown(!showDropDown)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M8.43994 10.125C7.47994 10.125 6.57494 9.61501 6.08494 8.79001C5.82494 8.37001 5.68994 7.88 5.68994 7.375C5.68994 5.86 6.92494 4.625 8.43994 4.625C9.95494 4.625 11.1899 5.86 11.1899 7.375C11.1899 7.88 11.0499 8.37001 10.7899 8.79501C10.3049 9.61501 9.40494 10.125 8.43994 10.125ZM8.43994 5.375C7.33494 5.375 6.43994 6.27 6.43994 7.375C6.43994 7.74 6.53994 8.09499 6.72994 8.39999C7.08994 9.00499 7.74494 9.375 8.43994 9.375C9.14994 9.375 9.78994 9.015 10.1499 8.405C10.3399 8.095 10.4399 7.74 10.4399 7.375C10.4399 6.27 9.54494 5.375 8.43994 5.375Z"
                            fill="#909090"/>
                        <path
                            d="M9.32993 7.73999H7.55493C7.34993 7.73999 7.17993 7.56999 7.17993 7.36499C7.17993 7.15999 7.34993 6.98999 7.55493 6.98999H9.32993C9.53493 6.98999 9.70493 7.15999 9.70493 7.36499C9.70493 7.56999 9.53493 7.73999 9.32993 7.73999Z"
                            fill="#909090"/>
                        <path
                            d="M8.43994 8.64499C8.23494 8.64499 8.06494 8.47499 8.06494 8.26999V6.5C8.06494 6.295 8.23494 6.125 8.43994 6.125C8.64494 6.125 8.81494 6.295 8.81494 6.5V8.27499C8.81494 8.47999 8.64994 8.64499 8.43994 8.64499Z"
                            fill="#909090"/>
                        <path
                            d="M5.4649 11.375C5.2249 11.375 4.9849 11.315 4.7699 11.195C4.3249 10.945 4.0599 10.495 4.0599 9.98999V7.315C4.0599 7.065 3.8949 6.68499 3.7349 6.48999L1.8349 4.495C1.5199 4.17 1.2749 3.62501 1.2749 3.22501V2.06C1.2749 1.255 1.8849 0.625 2.6599 0.625H9.3299C10.0949 0.625 10.7149 1.24501 10.7149 2.01001V3.12C10.7149 3.645 10.4049 4.23501 10.1049 4.54501L9.2049 5.34C9.1149 5.42 8.9899 5.44999 8.8699 5.42499C8.7349 5.38999 8.5899 5.375 8.4399 5.375C7.3349 5.375 6.4399 6.27 6.4399 7.375C6.4399 7.74 6.5399 8.095 6.7299 8.405C6.8899 8.67 7.1049 8.89001 7.3549 9.04501C7.4649 9.11501 7.5349 9.23499 7.5349 9.36499V9.535C7.5349 9.93 7.2949 10.485 6.8949 10.72L6.2049 11.165C5.9799 11.305 5.7199 11.375 5.4649 11.375ZM2.6649 1.375C2.3099 1.375 2.0299 1.675 2.0299 2.06V3.22501C2.0299 3.40501 2.1799 3.77501 2.3799 3.97501L4.3049 6C4.5599 6.315 4.8149 6.85001 4.8149 7.32001V9.995C4.8149 10.325 5.0449 10.49 5.1399 10.545C5.3549 10.665 5.6099 10.66 5.8049 10.54L6.5049 10.09C6.6399 10.01 6.7749 9.75501 6.7849 9.57501C6.5099 9.37001 6.2699 9.10499 6.0899 8.80499C5.8299 8.37999 5.6899 7.89002 5.6899 7.39002C5.6899 5.87502 6.9249 4.64002 8.4399 4.64002C8.5799 4.64002 8.7199 4.65001 8.8499 4.67001L9.5899 4.01501C9.7599 3.84001 9.9699 3.42501 9.9699 3.13001V2.01999C9.9699 1.66999 9.6849 1.38501 9.3349 1.38501H2.6649V1.375Z"
                            fill="#909090"/>
                    </svg>
                    <div>{getFilterCount()}</div>
                    <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L4 4L7 1" stroke="#909090" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {showDropDown && <div className="dropdown-options">
                        <StageButton type={StageEnum.Interested}
                                     selected={searchValue.stages[StageEnum.Interested]}
                                     onSelect={onStageSelected}/>
                        <StageButton type={StageEnum.NotInterested}
                                     selected={searchValue.stages[StageEnum.NotInterested]}
                                     onSelect={onStageSelected}/>
                        <StageButton type={StageEnum.Interviewing}
                                     selected={searchValue.stages[StageEnum.Interviewing]}
                                     onSelect={onStageSelected}/>
                        <StageButton type={StageEnum.FailedInterview}
                                     selected={searchValue.stages[StageEnum.FailedInterview]}
                                     onSelect={onStageSelected}/>
                        <StageButton type={StageEnum.Hired}
                                     selected={searchValue.stages[StageEnum.Hired]}
                                     onSelect={onStageSelected}/>
                    </div>}
                </div>
            </div>
            <div className="scroll-container">
                <div className="scroll-content">
                    {notesFiltered?.map((n, i) =>
                        (<NoteCard key={i} note={n} extended={true} onProfileSelect={onProfileSelect}/>))}
                    {notesFiltered.length == 0 && <div className="no-notes">No notes yet</div>}
                </div>
            </div>
            <Credits/>
        </React.Fragment>
    }

    const appendNote = (note: NoteExtended) => {
        setSelectedNotes([...notes, note]);
    }

    const back = () => {
        setSelection(undefined);
        setSelectedNotes([]);
        setSearchText("");
    }

    const postNote = (e: any) => {
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

    useEffect(() => {
        let filteredNotes = selectedNotes.filter(n => checkByText(n, searchText));
        setSelectedNotesFiltered(filteredNotes);
    }, [searchText, selectedNotes]);

    const updateSearchText = (e: any) => setSearchText(e.target.value?.trim());

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
                <label className="notes-counter">{selectedNotesFiltered ? selectedNotesFiltered.length : 0}</label>
            </div>
            <div className="search-bar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6.70835 12.6876C3.41252 12.6876 0.729187 10.0042 0.729187 6.70841C0.729187 3.41258 3.41252 0.729248 6.70835 0.729248C10.0042 0.729248 12.6875 3.41258 12.6875 6.70841C12.6875 10.0042 10.0042 12.6876 6.70835 12.6876ZM6.70835 1.60425C3.89085 1.60425 1.60419 3.89675 1.60419 6.70841C1.60419 9.52008 3.89085 11.8126 6.70835 11.8126C9.52585 11.8126 11.8125 9.52008 11.8125 6.70841C11.8125 3.89675 9.52585 1.60425 6.70835 1.60425Z"
                        fill="#909090"/>
                    <path
                        d="M12.8334 13.2709C12.7225 13.2709 12.6117 13.2301 12.5242 13.1426L11.3575 11.9759C11.1884 11.8068 11.1884 11.5268 11.3575 11.3576C11.5267 11.1884 11.8067 11.1884 11.9759 11.3576L13.1425 12.5243C13.3117 12.6934 13.3117 12.9734 13.1425 13.1426C13.055 13.2301 12.9442 13.2709 12.8334 13.2709Z"
                        fill="#909090"/>
                </svg>
                <input type="text" onKeyUp={updateSearchText} placeholder="Filter"/>
            </div>
            <div className="scroll-container">
                <div className="scroll-content">
                    {selectedNotesFiltered?.map((n, i) =>
                        (<NoteCard key={i} note={n}/>))}
                    {selectedNotesFiltered.length == 0 && <div className="no-notes">No notes yet</div>}
                </div>
            </div>
            <div className="footer-child">
                <input type="text" onKeyUp={postNote} disabled={!editable} className="text-input"
                       placeholder="Leave a note"/>
                <Credits/>
            </div>
        </React.Fragment>
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="notes-manager">
                <NotesContainer>
                    <AccessGuard setAccessState={setAccessState} className={"access-guard-px16 m-1"}
                                 loaderClassName={"loader-base loader-px24"}/>
                    {accessState === AccessState.Valid &&
                    <React.Fragment>
                        {completed ?
                            (selection == undefined ? getAllNotes() : getSelectedNotes())
                            : <div className="centered-loader"><Loader show={!completed}/></div>}
                    </React.Fragment>}
                </NotesContainer>
            </div>
        </React.Fragment>
    );

}