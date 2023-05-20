import React, {useEffect, useRef, useState} from "react";
import {extractIdFromUrl, NoteExtended, VERBOSE} from "../../global";
import {MessagesV2} from "@stolbivi/pirojok";
import {Loader} from "../../components/Loader";
import {NoteCard} from "./NoteCard";
import {injectFirstChild} from "../../utils/InjectHelper";
import {StageEnum, StageLabels} from "./StageSwitch";
import {AccessGuard, AccessState} from "../AccessGuard";
import {Credits} from "../Credits";
import {Submit} from "../../icons/Submit";
import {NoNotes} from "../../icons/NoNotes";
import {getCustomStages, getTheme, getUserIdByUrn, openUrl, sortAsc, sortDesc, SwitchThemePayload} from "../../actions";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../../themes/ThemeUtils";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as LightTheme} from "../../themes/light";
import {theme as DarkTheme} from "../../themes/dark";
import {CompleteEnabled, DataWrapper, localStore, selectNotesAll} from "../../store/LocalStore";
import {Provider, shallowEqual, useSelector} from "react-redux";
import {getNotesAction, postNoteAction} from "../../store/NotesAllReducer";
import {NotesContainer} from "./NotesContainer";

// @ts-ignore
import stylesheet from "./NotesManager.scss";
import {useUrlChangeSupport} from "../../utils/URLChangeSupport";

export const NotesManagerFactory = () => {
    setTimeout(() => {
        const aside = document.getElementsByClassName("scaffold-layout__aside");
        if (aside && aside.length > 0) {
            if (window.location.href.indexOf("/in/") > 0 || window.location.href.indexOf("/messaging/") > 0) {
                injectFirstChild(aside[0], "lnm-notes-manager",
                    <Provider store={localStore}>
                        <NotesManager showProfileNotes={true}/>
                    </Provider>, "NotesManager"
                );
            } else {
                injectFirstChild(aside[0], "lnm-notes-manager",
                    <Provider store={localStore}>
                        <NotesManager/>
                    </Provider>, "NotesManager"
                );
            }
        }
    }, 1000);
}

type Props = {
    showProfileNotes?: any
};

interface SearchValue {
    text: string
    stages: { [key: number]: boolean }
}

export const NotesManager: React.FC<Props> = ({showProfileNotes}) => {

    const MAX_LENGTH = 200;
    const DEFAULT_SEARCH = {text: "", stages: {}};

    const messages = new MessagesV2(VERBOSE);

    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [editable, setEditable] = useState<boolean>(true);
    const [searchValue, setSearchValue] = useState<SearchValue>(DEFAULT_SEARCH);
    const [searchText, setSearchText] = useState<string>("");
    const [postAllowed, setPostAllowed] = useState<boolean>(false);
    const [text, setText] = useState<{ value: string }>({value: ""});
    const [selection, setSelection] = useState<any>();
    const notesAll: CompleteEnabled<DataWrapper<NoteExtended[]>> = useSelector(selectNotesAll, shallowEqual);
    const [notes, setNotes] = useState<NoteExtended[]>([]);
    const lastNoteRef = useRef();
    const [backdrop, setBackDrop] = useState(false);
    const [url] = useUrlChangeSupport(window.location.href);


    useEffect(() => {
        messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                updateTheme(payload.theme);
                return Promise.resolve();
            }));
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                let theme = payload.theme === "light" ? LightTheme : DarkTheme;
                setThemeUtil(theme, rootElement);
                return Promise.resolve();
            }));
    }, []);

    useEffect(() => {
        messages.request(getCustomStages())
            .then((customStages) => {
                if (customStages.length > 0) {
                    const stageEnumLength = Object.keys(StageEnum).filter(k => isNaN(Number(k))).length;
                    let count = stageEnumLength + 1;
                    customStages.map(stage => {
                        // @ts-ignore
                        if (!StageEnum[stage.text]) {
                            // @ts-ignore
                            StageEnum[stage.text] = count;
                        }
                        if (!StageLabels[count] && !Object.values(StageLabels).some(({label}) => label === stage.text)) {
                            StageLabels[count] = {label: stage.text, class: "interested"};
                        }
                        count++;
                    });
                }
            })
    }, []);

    useEffect(() => {
        setPostAllowed(text && text.value.length > 0);
    }, [text]);

    useEffect(() => {
        if (accessState !== AccessState.Valid) {
            return;
        }
        if (!notesAll?.completed) {
            localStore.dispatch(getNotesAction());
        }
    }, [accessState]);

    const checkByText = (n: NoteExtended, text: string) => {
        if (text && text.length > 1) {
            return n.profileName.toLowerCase().indexOf(text) >= 0
                || n.authorName.toLowerCase().indexOf(text) >= 0
                || n.text?.toLowerCase().indexOf(text) >= 0
        } else {
            return true;
        }
    }

    useEffect(() => {
        if (selection) {
            setSearchValue(DEFAULT_SEARCH);
        }
    }, [selection])


    useEffect(() => {
        const stagesCount = Object.values(searchValue.stages).filter(v => v).length;
        let filteredNotes;
        if (selection) {
            // search by text
            filteredNotes = notesAll?.data?.filter(n => n.profile === selection.profile
                && checkByText(n, searchText?.toLowerCase()));
            sortAsc(filteredNotes);
        } else {
            // search by value
            filteredNotes = notesAll?.data?.filter(
                n => checkByText(n, searchValue.text?.toLowerCase()) &&
                    (stagesCount > 0 ? (searchValue.stages[n.stageFrom] || searchValue.stages[n.stageTo]) : true)
            );
            sortDesc(filteredNotes);
        }
        setNotes(filteredNotes);
    }, [selection, searchValue, searchText, notesAll]);

    useEffect(() => {
        if (showProfileNotes && notesAll.data.length > 0) {
            // @ts-ignore
            let urn = document.querySelector(".app-aware-link.msg-thread__link-to-profile")?.href;
            let profileID: string;
            if (urn) {
                let regex = /\/in\/(.+)/;
                const match = regex.exec(urn);
                profileID = match[1];
            }
            if (!profileID) {
                messages.request(getUserIdByUrn(extractIdFromUrl(window.location.href)))
                    .then((profileId) => {
                        profileID = profileId;
                        const note = notesAll?.data?.find(noteObj => noteObj.profile === profileID);
                        if (note) {
                            setSelection({
                                profile: note.profile,
                                profileName: note.profileName,
                                profilePicture: note.profilePicture,
                                profileLink: note.profileLink
                            });
                        } else {
                            setSelection(undefined);
                        }
                    });
            } else {
                const note = notesAll?.data?.find(noteObj => noteObj.profile === profileID);
                if (note) {
                    setSelection({
                        profile: note.profile,
                        profileName: note.profileName,
                        profilePicture: note.profilePicture,
                        profileLink: note.profileLink
                    });
                }
            }
        }
    }, [notesAll, url]);

    const onProfileSelect = (profile: any) => setSelection(profile);

    const updateSearchValueWithText = (e: any) =>
        setSearchValue({...searchValue, text: e.target.value?.trim()});

    const getAllNotes = () => {
        return <React.Fragment>
            <div className="notes-title">
                {
                    backdrop ? (<div className="popup-backdrop" onClick={() => {
                        setBackDrop(false);
                    }}></div>) : null
                }
                <label>History</label>
                <label className="notes-counter">{notes ? notes.length : 0}</label>
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
            </div>
            <div className="scroll-container">
                <div className="scroll-content">
                    {notes?.map((n, i) =>
                        (<NoteCard key={i} note={n} extended={true} onProfileSelect={onProfileSelect}
                                   currentCount={i} totalCount={notes.length} lastNoteRef={lastNoteRef}/>))}
                    {notes.length == 0 &&
                        <div className="no-notes">
                            <NoNotes/>
                            <div>No notes yet</div>
                        </div>
                    }
                </div>
            </div>
            <Credits short={true}/>
        </React.Fragment>
    }

    const back = () => {
        setSelection(undefined);
        setSearchText("");
    }

    const onChange = (e: any) => {
        let text = e.target.value;
        setText({value: text});
    }

    const onKeyUp = (e: any) => {
        if (e.code === 'Enter') {
            postNote(text?.value)
        }
    }

    const postNote = (text: string) => {
        if (text && text !== "") {
            text = text.slice(0, MAX_LENGTH);
            setEditable(false);
            localStore.dispatch(postNoteAction({id: selection.profile, stageTo: -1, text}));
            setText({value: ""});
            setEditable(true);
        }
    }

    const updateSearchText = (e: any) => setSearchText(e.target.value?.trim());

    const openProfile = (link: string) => {
        if (link) {
            return messages.request(openUrl(link));
        }
    }

    const getSelectedNotes = () => {
        return <React.Fragment>
            <div className="notes-header">
                <div className="back-button" onClick={() => back()}>
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.2" d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="clickable" onClick={() => openProfile(selection.profileLink)}>
                    <img src={selection.profilePicture}/>
                    <div className="name">{selection.profileName}</div>
                </div>
            </div>
            <div className="notes-title">
                <label>History</label>
                <label className="notes-counter">{notes ? notes.length : 0}</label>
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
                    {notes?.map((n, i) =>
                        (<NoteCard key={i} note={n}
                                   currentCount={i} totalCount={notes.length} lastNoteRef={lastNoteRef}/>))}
                    {notes.length == 0 &&
                        <div className="no-notes">
                            <NoNotes/>
                            <div>No notes yet</div>
                        </div>}
                </div>
            </div>
            <div className="footer-child">
                <div className="text-input-container">
                    <div className="text-input">
                        <input type="text" onKeyUp={onKeyUp} onChange={onChange}
                               disabled={!editable}
                               placeholder="Leave a note" value={text?.value}/>
                        <div onClick={() => postNote(text?.value)}
                             className={postAllowed ? "submit-allowed" : "submit-disabled"}>
                            <Submit/>
                        </div>
                    </div>
                </div>
                <Credits/>
            </div>
        </React.Fragment>
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="notes-manager" ref={rootElement}>
                <NotesContainer>
                    <AccessGuard setAccessState={setAccessState} className={"access-guard-px16 m-1"}
                                 loaderClassName={"loader-base loader-px24"}/>
                    {accessState === AccessState.Valid &&
                        <React.Fragment>
                            {notesAll?.completed ?
                                (selection == undefined ? getAllNotes() : getSelectedNotes())
                                : <div className="centered-loader"><Loader show={!notesAll?.completed}/></div>}
                        </React.Fragment>}
                </NotesContainer>
            </div>
        </React.Fragment>
    );

}
