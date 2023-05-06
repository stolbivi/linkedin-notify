import React, {FormEvent, useEffect, useRef, useState} from "react";
import {NotesContainer} from "./NotesContainer";
import {Collapsible, CollapsibleRole} from "./Collapsible";
import {PayDistribution} from "./PayDistribution";
import {getSalaryValue} from "../SalaryPill";
import {stageChildData, StageEnum, StageLabels, StageParentData, stageParentsData, StageSwitch} from "./StageSwitch";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, NoteExtended, UserStage, VERBOSE} from "../../global";
import {inject} from "../../utils/InjectHelper";
import {Loader} from "../../components/Loader";
import {NoteCard} from "./NoteCard";
import {PayExtrapolationChart} from "./PayExtrapolationChart";
import {Credits} from "../Credits";
import {Submit} from "../../icons/Submit";
import {NoNotes} from "../../icons/NoNotes";
import {createCustomStage, getCustomSalary, getCustomStages, getTheme, setCustomSalary} from "../../actions";
import {
    CompleteEnabled,
    DataWrapper,
    IdAwareState,
    localStore,
    selectNotesAll,
    selectSalary,
    selectShowNotesAndCharts,
    selectStage
} from "../../store/LocalStore";
import {Provider, shallowEqual, useSelector} from "react-redux";
import {getSalaryAction, Salary} from "../../store/SalaryReducer";
import {getStageAction, Stage} from "../../store/StageReducer";
// @ts-ignore
import stylesheet from "./NotesAndCharts.scss";
import {useThemeSupport} from "../../themes/ThemeUtils";
import {theme as LightTheme} from "../../themes/light";
import AssignedJobs from "../../components/AssignedJobs";
import {ShowNotesAndCharts, showNotesAndChartsAction} from "../../store/ShowNotesAndCharts";
import {useUrlChangeSupport} from "../../utils/URLChangeSupport";
import {getNotesAction,postNoteAction} from "../../store/NotesAllReducer";

export const NotesAndChartsFactory = () => {
    setTimeout(() => {
        // individual profile
        if (window.location.href.indexOf("/in/") > 0) {
            const section = document.querySelectorAll('section[data-member-id]');
            if (section && section.length > 0) {
                inject(section[0].lastChild, "lnm-notes-and-charts", "after",
                    <Provider store={localStore}>
                        <NotesAndCharts id={extractIdFromUrl(window.location.href)} trackUrl={true}/>
                    </Provider>, "NotesAndCharts"
                );
            }
        } else if (window.location.href.indexOf("/messaging/") > 0) {
            const section = document.getElementsByClassName("scaffold-layout__list-detail msg__list-detail");
            if (section && section.length > 0) {
                inject(section[0].lastChild, "lnm-notes-and-charts", "after",
                    <Provider store={localStore}>
                        <NotesAndCharts id={extractIdFromUrl(window.location.href)} trackUrl={true} conversation/>
                    </Provider>, "NotesAndCharts"
                );
            }
        }
        const section = document.querySelectorAll(".kanban-title");
        if (section && section.length > 0) {
            inject(section[0].lastChild, "lnm-notes-and-charts", "after",
                <Provider store={localStore}>
                <NotesAndCharts id={extractIdFromUrl(window.location.href)} trackUrl={true}/>
                </Provider>, "NotesAndCharts"
            );
        }
        // people's search
        if (window.location.href.toLowerCase().indexOf("search/results/people/") > 0) {
            const profileCards = document.querySelectorAll('[data-chameleon-result-urn*="urn:li:member:"]');
            if (profileCards.length > 0) {
                profileCards.forEach((card: HTMLDivElement, index) => {
                    card.style.position = "relative";
                    const profileLink = card.querySelectorAll('a[href*="/in/"]');
                    if (profileLink.length > 0) {
                        const link = profileLink[0].getAttribute("href");
                        const profileActions = card.getElementsByClassName('entity-result__actions');
                        if (profileActions.length > 0) {
                            const lastChild = profileActions[0].childNodes[profileActions[0].childNodes.length - 1];
                            const id = extractIdFromUrl(link);
                            inject(lastChild, `lnm-notes-and-charts-${index}`, "after",
                                <NotesAndCharts id={id}/>, "NotesAndCharts"
                            );
                        }
                    }
                })
            }
        }
    }, 100);
}

type Props = {
    id: string
    trackUrl?: boolean
    conversation?: boolean
};

export const NotesAndCharts: React.FC<Props> = ({id, trackUrl = false, conversation = false}) => {

    const MAX_LENGTH = 200;

    const [idInternal, setIdInternal] = useState<string>(id);
    const [showSalary, setShowSalary] = useState<boolean>(false);
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const [showStages] = useState<boolean>(true);
    const [show] = useState<boolean>(false);
    const [showChart, setShowChart] = useState<boolean>(false);
    const [minimized, setMinimized] = useState<boolean>(true);
    const [editable, setEditable] = useState<boolean>(true);
    const [postAllowed, setPostAllowed] = useState<boolean>(false);
    const [text, setText] = useState<{ value: string }>({value: ""});
    const [stageParents] = useState([...stageParentsData]);
    const [customStages, setCustomStages] = useState<UserStage[]>([]);
    const [editButton, setEditButton] = useState(false);
    const [currencySymbol, setCurrencySymbol] = useState("");
    const [salaryLabel, setSalaryLabel] = useState("");
    const [fromListView] = useState(false);
    const [allGroupsMode, setAllGroupsMode] = useState(false);
    const listviewNotesRef = useRef();
    const [fetchCustomSalary, setFetchCustomSalary] = useState(false);
    const [salaryInternal, setSalaryInternal] = useState({});
    const messages = new MessagesV2(VERBOSE);
    const inputRef = useRef<HTMLInputElement>(null);

    const [theme, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);
    const showNotesAndCharts: IdAwareState<ShowNotesAndCharts> = useSelector(selectShowNotesAndCharts, shallowEqual);
    const salary: IdAwareState<CompleteEnabled<Salary>> = useSelector(selectSalary, shallowEqual);
    const stage: IdAwareState<CompleteEnabled<Stage>> = useSelector(selectStage, shallowEqual);
    const notesAll: CompleteEnabled<DataWrapper<NoteExtended[]>> = useSelector(selectNotesAll, shallowEqual);
    const [notes, setNotes] = useState<NoteExtended[]>([]);
    const [url] = useUrlChangeSupport(window.location.href);
    const lastNoteRef = useRef();
    const localLoaderRef = useRef();

    useEffect(() => {
        if (url?.length > 0 && trackUrl) {
            setIdInternal(extractIdFromUrl(url))
        }
    }, [url]);

/*    useEffect(() => {
        // @ts-ignore
        lastNoteRef?.current?.scrollIntoView({behavior: 'smooth'});
    },[notesAll,lastNoteRef.current]);*/

    const extractFromIdAware = (idAware: IdAwareState<CompleteEnabled<any>>):
        CompleteEnabled<any> => idAware && idAware[idInternal] ? idAware[idInternal] : {};

    useEffect(() => {
        if("lndashboard" !== idInternal) {
            localStore.dispatch(getNotesAction());
            localStore.dispatch(getSalaryAction({id: idInternal, state: {id: idInternal, conversation: conversation}}));
            localStore.dispatch(getStageAction({id: idInternal, state: {url: idInternal}}));
        }
    }, [idInternal]);

    useEffect(() => {
        if (extractFromIdAware(salary)) {
            if (notesAll?.data?.length > 0) {
                let filtered = notesAll?.data?.filter(n => n.profile === extractFromIdAware(salary).urn);
                setNotes(filtered);
            }
        }
    }, [notesAll, salary]);

    useEffect(() => {
        setPostAllowed(text && text.value.length > 0);
    }, [text]);

    useEffect(() => {
        debugger
        if (extractFromIdAware(showNotesAndCharts)) {
            const profileId = showNotesAndCharts?.profileId;
            if(profileId && showNotesAndCharts[profileId]?.id && !showNotes) {
                setIdInternal(showNotesAndCharts[profileId]?.id)
                setShowNotes(showNotesAndCharts[profileId]?.showNotes)
                setShowSalary(showNotesAndCharts[profileId]?.showSalary)
            } else {
                setShowNotes(extractFromIdAware(showNotesAndCharts).showNotes)
                setShowSalary(extractFromIdAware(showNotesAndCharts).showSalary)
            }
            if (extractFromIdAware(showNotesAndCharts).show || (profileId && showNotesAndCharts[profileId]?.show && !showNotes)) {
                messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
                setTimeout(() => setMinimized(false), 100);
            } else {
                setMinimized(true);
            }
        }
    }, [showNotesAndCharts]);

    const canShow = () => extractFromIdAware(showNotesAndCharts)?.show;
    const completed = () => extractFromIdAware(salary).completed;

    useEffect(() => {
        messages.request(getCustomStages())
            .then((r) => setCustomStages(r))
    },[]);

/*
    const populateSalaryStagesAndNotes = (urn: string) => {
        messages.request(getSalary(urn))
            .then((r) => {
                const salary = {...r.result, title: r.title, urn: r.urn};
                setSalaryInternal(salary);
                return salary;
            }).then(salary => {
            const stagePromise = messages.request(getStages({id: salary.urn}))
                .then((r) => setStageInternal(r?.response?.stage >= 0 ? r?.response?.stage : -1))
                .catch(e => console.error(e.error));
            const notesPromise = messages.request(getNotesByProfile(salary.urn))
                .then((r) => setNotes(r.response))
                .catch(e => console.error(e.error));
            const customStagePromise = messages.request(getCustomStages())
                .then((r) => setCustomStages(r))
                .catch(e => console.error(e.error));
            Promise.all([stagePromise, notesPromise, customStagePromise]).then(() => setCompleted(true));
        }).catch(e => console.error(e.error));
    }*/

/*    useEffect(() => {
        const listener = () => {
            setShow(false);
        }
        window.addEventListener('popstate', listener);
        let profileId = extractIdFromUrl(window.location.href);
        messages.listen(createAction<ShowNotesAndChartsPayload, any>("showNotesAndCharts",
            (payload) => {
                if(payload.id) {
                    populateSalaryStagesAndNotes(payload.id);
                }
                if (id && payload?.id !== id) {
                    return Promise.resolve();
                }
                if(payload.id) {
                    messages.request(getSalary(payload.id))
                        .then((r) => {
                            const salary = {...r.result, title: r.title, urn: r.urn};
                            setSalaryInternal(salary);
                        })
                }
                if(payload.userId) {
                    profileId = payload?.userId?.trim();
                    populateSalaryStagesAndNotes(profileId);
                    setFromListView(true);
                }
                setShowNotes(payload?.showNotes)
                setShowSalary(payload?.showSalary)
                setShowStages(payload?.showStages)
                setFetchCustomSalary(true);
                setShow(true);
                return Promise.resolve();
        }));
        if (conversation) {
            messages.request(getConversationProfile(profileId))
                .then((r: any) => {
                    const entityUrns = r.participants.map((participant: any) => {
                        return participant["com.linkedin.voyager.messaging.MessagingMember"].miniProfile.entityUrn.split(":")[3];
                    });
                    populateSalaryStagesAndNotes(entityUrns[0]);
                });
        } else {
            populateSalaryStagesAndNotes(profileId);
        }
        return () => window.removeEventListener('popstate', listener)
    }, [window.location.href]);*/

    useEffect(() => {
        if(showSalary && fetchCustomSalary && !editButton) {
            messages.request(getCustomSalary(extractFromIdAware(salary).urn)).then(resp => {
                const clonedSalary = {...extractFromIdAware(salary)};
                clonedSalary.payDistributionValues[0] = resp[0].leftPayDistribution;
                clonedSalary.payDistributionValues[clonedSalary.payDistributionValues.length - 1] = resp[0].rightPayDistribution;
                clonedSalary.progressivePay = resp[0].progressivePay;
                setSalaryInternal(clonedSalary);
                setFetchCustomSalary(false);
            })
        }
        setSalaryLabel(extractFromIdAware(salary) && getSalaryValue(extractFromIdAware(salary) as Salary));
    },[salary]);

    useEffect(() => {
        if(fromListView) {
            const timeoutId = setTimeout(() => {
                // @ts-ignore
                localLoaderRef?.current?.scrollIntoView({ behavior: 'smooth' });
                // @ts-ignore
                localLoaderRef?.current?.focus();
            }, 500); // set delay time in milliseconds

            return () => clearTimeout(timeoutId);
        }
    }, [localLoaderRef, fromListView, completed]);

    useEffect(()=>{
        if (salaryLabel){
            setCurrencySymbol(salaryLabel[0]);
            if(document.querySelector(".Salary div") && document.querySelector(".Salary div").shadowRoot.querySelector(".salary-pill span")){
                (document.querySelector(".Salary div").shadowRoot.querySelector(".salary-pill span") as HTMLElement).innerText = salaryLabel;
            }
        }
    },[salaryLabel])

    useEffect(() => {
        if (show) {
            messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
            setTimeout(() => setMinimized(false), 100);
        } else {
            setMinimized(true);
        }
    }, [show]);

    useEffect(() => {
        if (inputRef?.current) {
            inputRef?.current?.focus();
        }
    }, []);

    useEffect(() => {
        setPostAllowed(text && text.value.length > 0);
    }, [text]);

    const postNote = (text: string) => {
        if (text && text !== "") {
            text = text.slice(0, MAX_LENGTH);
            setEditable(false);
            setPostAllowed(false);
            localStore.dispatch(postNoteAction({
                id: extractFromIdAware(salary).urn,
                stageTo: extractFromIdAware(stage).stage,
                text
            }));
            setText({value: ""});
            setEditable(true);
        }
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

    const close = () => {
        setShowChart(false);
        localStore.dispatch(showNotesAndChartsAction({
            id: idInternal,
            state: {showSalary: false, showNotes: false, show: false}
        }));
        const body = document.querySelector('body');
        body.classList.remove('popup-open');
    }

    const onExpanded = () => {
        setShowChart(true);
        const body = document.querySelector('body');
        body.classList.add('popup-open');
    }

    const CreateNewGroup = () => {
        const [isCreating, setIsCreating] = useState(false)
        const [customName, setCustomName] = useState('')
        const [loading, setLoading] = useState(false)

        const handleCustomTagSubmit = async (e: FormEvent) => {
            e.preventDefault();
            if (customName === '') return;
            setLoading(true)
            messages.request(createCustomStage({text: customName}))
                .then((r) => {
                    let temp = [...customStages]
                    const {author, stageId, text, userId, id} = r
                    temp.push({author, id, stageId, text, userId});
                    const stageEnumLength = Object.keys(StageEnum).filter(k => isNaN(Number(k))).length;
                    let count = stageEnumLength + 1;
                    // @ts-ignore
                    if(!StageEnum[text]) {
                        // @ts-ignore
                        StageEnum[text] = count;
                    }
                    if(!StageLabels[count] && !Object.values(StageLabels).some(({ label }) => label === text)) {
                        StageLabels[count] = {label: text, class: "interested"};
                    }
                    setCustomStages(temp);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }

        return (
            <React.Fragment>
                {loading
                    ? <>loading...</>
                    : <div onClick={!isCreating ? () => setIsCreating(true) : undefined}
                           style={{cursor: "pointer"}}
                           className={`create-new-group-wrapper customPill ${isCreating ? "is-creating" : ""}`}>
                        {isCreating ?
                            <form onSubmit={handleCustomTagSubmit}>
                                <input value={customName}
                                       onChange={e => setCustomName(e.currentTarget.value)}
                                       placeholder='Enter Name'/>
                            </form>
                            : 'Add Group'
                        }
                    </div>
                }
            </React.Fragment>
        )
    }

    useEffect(() => {
        if(customStages.length > 0) {
            const stageEnumLength = Object.keys(StageEnum).filter(k => isNaN(Number(k))).length;
            let count = stageEnumLength + 1;
            customStages.map(stage => {
                // @ts-ignore
                if(!StageEnum[stage.text]) {
                    // @ts-ignore
                    StageEnum[stage.text] = count;
                }
                if(!StageLabels[count] && !Object.values(StageLabels).some(({ label }) => label === stage.text)) {
                    StageLabels[count] = {label: stage.text, class: "interested"};
                }
                count++;
            });
        }
    }, [customStages]);

    const editOnClick = (event: any) => {
        event.stopPropagation();
        if(editButton) {
            messages.request(setCustomSalary(salary)).then(resp => {
                console.log(resp);
            })
        }
        setEditButton(!editButton);
    }


    const notesAndChartsClass = `notes-and-charts ${completed && !minimized ? 'position-expanded' : 'position-collapsed'} ${(!showSalary) ? 'custom-width' : ''} ${(fromListView) ? 'position-expanded-listview' : ''}`;

    // @ts-ignore
    return (
        <React.Fragment>
            {canShow() &&
                <React.Fragment>
                    <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
                    <div className="popup-backdrop" onClick={() => close()}></div>
                    <div id="notes-charts-container" onTransitionEnd={() => onExpanded()}
                         className={notesAndChartsClass}
                         ref={rootElement}
                         style={{...(!showSalary && { width: '1000px !important' })}}>
                        <div className="close-button" onClick={() => close()}>
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L15 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                <path d="M15 2L2 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <React.Fragment>
                            <div className="local-loader" ref={localLoaderRef}><Loader show={!completed()}/></div>
                            {completed && !minimized &&
                            <NotesContainer>
                                {showSalary && (
                                    <Collapsible initialOpened={showSalary}>
                                            <div data-role={CollapsibleRole.Title} className="salary-title">
                                                <span className="salary-title-text">Avg. Base Salary (GBR)</span>
                                                {
                                                    editButton ? (
                                                    <svg width="20" height="20" className="icon-color"
                                                         onClick={(event) => editOnClick(event)} fill="#585858" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                                        <g id="SVGRepo_iconCarrier">
                                                        <g fillRule="evenodd">
                                                        <path d="M65.456 48.385c10.02 0 96.169-.355 96.169-.355 2.209-.009 5.593.749 7.563 1.693 0 0-1.283-1.379.517.485 1.613 1.67 35.572 36.71 36.236 37.416.665.707.241.332.241.332.924 2.007 1.539 5.48 1.539 7.691v95.612c0 7.083-8.478 16.618-16.575 16.618-8.098 0-118.535-.331-126.622-.331-8.087 0-16-6.27-16.356-16.1-.356-9.832.356-118.263.356-126.8 0-8.536 6.912-16.261 16.932-16.261zm-1.838 17.853l.15 121c.003 2.198 1.8 4.003 4.012 4.015l120.562.638a3.971 3.971 0 0 0 4-3.981l-.143-90.364c-.001-1.098-.649-2.616-1.445-3.388L161.52 65.841c-.801-.776-1.443-.503-1.443.601v35.142c0 3.339-4.635 9.14-8.833 9.14H90.846c-4.6 0-9.56-4.714-9.56-9.14s-.014-35.14-.014-35.14c0-1.104-.892-2.01-1.992-2.023l-13.674-.155a1.968 1.968 0 0 0-1.988 1.972zm32.542.44v27.805c0 1.1.896 2.001 2 2.001h44.701c1.113 0 2-.896 2-2.001V66.679a2.004 2.004 0 0 0-2-2.002h-44.7c-1.114 0-2 .896-2 2.002z"></path>
                                                        <path d="M127.802 119.893c16.176.255 31.833 14.428 31.833 31.728s-14.615 31.782-31.016 31.524c-16.401-.259-32.728-14.764-32.728-31.544s15.735-31.963 31.91-31.708zm-16.158 31.31c0 9.676 7.685 16.882 16.218 16.843 8.534-.039 15.769-7.128 15.812-16.69.043-9.563-7.708-16.351-15.985-16.351-8.276 0-16.045 6.52-16.045 16.197z"></path>
                                                        </g>
                                                        </g>
                                                    </svg>
                                                    ) : (
                                                        <svg onClick={(event) => editOnClick(event)} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11.25 17.0625H6.75C2.6775 17.0625 0.9375 15.3225 0.9375 11.25V6.75C0.9375 2.6775 2.6775 0.9375 6.75 0.9375H8.25C8.5575 0.9375 8.8125 1.1925 8.8125 1.5C8.8125 1.8075 8.5575 2.0625 8.25 2.0625H6.75C3.2925 2.0625 2.0625 3.2925 2.0625 6.75V11.25C2.0625 14.7075 3.2925 15.9375 6.75 15.9375H11.25C14.7075 15.9375 15.9375 14.7075 15.9375 11.25V9.75C15.9375 9.4425 16.1925 9.1875 16.5 9.1875C16.8075 9.1875 17.0625 9.4425 17.0625 9.75V11.25C17.0625 15.3225 15.3225 17.0625 11.25 17.0625Z" fill="#1569BF"/>
                                                            <path d="M6.375 13.2675C5.9175 13.2675 5.4975 13.1025 5.19 12.8025C4.8225 12.435 4.665 11.9025 4.7475 11.34L5.07 9.08248C5.13 8.64748 5.415 8.08498 5.7225 7.77748L11.6325 1.86748C13.125 0.374983 14.64 0.374983 16.1325 1.86748C16.95 2.68498 17.3175 3.51748 17.2425 4.34998C17.175 5.02498 16.815 5.68498 16.1325 6.35998L10.2225 12.27C9.915 12.5775 9.3525 12.8625 8.9175 12.9225L6.66 13.245C6.5625 13.2675 6.465 13.2675 6.375 13.2675ZM12.4275 2.66248L6.5175 8.57248C6.375 8.71498 6.21 9.04498 6.18 9.23998L5.8575 11.4975C5.8275 11.715 5.8725 11.895 5.985 12.0075C6.0975 12.12 6.2775 12.165 6.495 12.135L8.7525 11.8125C8.9475 11.7825 9.285 11.6175 9.42 11.475L15.33 5.56498C15.8175 5.07748 16.0725 4.64248 16.11 4.23748C16.155 3.74998 15.9 3.23248 15.33 2.65498C14.13 1.45498 13.305 1.79248 12.4275 2.66248Z" fill="#1569BF"/>
                                                            <path d="M14.8875 7.37252C14.835 7.37252 14.7825 7.36502 14.7375 7.35002C12.765 6.79502 11.1975 5.22752 10.6425 3.25502C10.56 2.95502 10.7325 2.64752 11.0325 2.55752C11.3325 2.47502 11.64 2.64752 11.7225 2.94752C12.1725 4.54502 13.44 5.81252 15.0375 6.26252C15.3375 6.34502 15.51 6.66002 15.4275 6.96002C15.36 7.21502 15.135 7.37252 14.8875 7.37252Z" fill="#1569BF"/>
                                                        </svg>
                                                    )
                                                }
                                            </div>
                                        <div data-role={CollapsibleRole.Static}>
                                            <div className="d-flex">
                                                <section className="label-section">
                                                    {
                                                        editButton
                                                            ?(
                                                                <input
                                                                    className="label-salary-edit"
                                                                    placeholder={salaryLabel}
                                                                    onChange={(event) => {
                                                                        const value = event.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                                                                        const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Format value with commas
                                                                        setSalaryLabel(currencySymbol + formattedValue);
                                                                    }}
                                                                    onKeyDown={(event) => {
                                                                        if (event.key === 'Enter') {
                                                                            editOnClick(event);
                                                                        }
                                                                    }}
                                                                />
                                                            )
                                                            :(<div className="label-salary">{extractFromIdAware(salary) && getSalaryValue(extractFromIdAware(salary) as Salary)} year</div>)
                                                    }
                                                    <div className="label-position">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M12.3026 4.07164C11.8068 3.5233 10.9784 3.24914 9.77677 3.24914H9.63677V3.2258C9.63677 2.2458 9.63677 1.03247 7.44344 1.03247H6.55677C4.36344 1.03247 4.36344 2.25164 4.36344 3.2258V3.25497H4.22344C3.01594 3.25497 2.19344 3.52914 1.6976 4.07747C1.1201 4.71914 1.1376 5.58247 1.19594 6.17164L1.20177 6.21247L1.23756 6.58825C1.25182 6.73803 1.33257 6.87353 1.45885 6.95532C1.59644 7.04445 1.77488 7.15763 1.8901 7.22164C1.97177 7.27414 2.05927 7.3208 2.14677 7.36747C3.14427 7.9158 4.24094 8.2833 5.3551 8.46414C5.4076 9.01247 5.64677 9.65414 6.92427 9.65414C8.20177 9.65414 8.4526 9.0183 8.49344 8.45247C9.68344 8.25997 10.8326 7.8458 11.8709 7.23914C11.9059 7.22164 11.9293 7.20414 11.9584 7.18664C12.1661 7.06928 12.3807 6.92748 12.5806 6.78556C12.6905 6.70759 12.7602 6.58552 12.7751 6.45164V6.45164L12.8043 6.17747C12.8101 6.14247 12.8101 6.1133 12.8159 6.07247C12.8626 5.4833 12.8509 4.6783 12.3026 4.07164ZM7.63594 8.06747C7.63594 8.6858 7.63594 8.77914 6.91844 8.77914C6.20094 8.77914 6.20094 8.6683 6.20094 8.0733V7.3383H7.63594V8.06747ZM5.1976 3.24914V3.2258C5.1976 2.23414 5.1976 1.86664 6.55677 1.86664H7.44344C8.8026 1.86664 8.8026 2.23997 8.8026 3.2258V3.25497H5.1976V3.24914Z"
                                                                fill="#909090"/>
                                                            <path
                                                                d="M11.838 8.17058C12.1932 8.00568 12.601 8.28659 12.5656 8.67657L12.39 10.6108C12.2675 11.7775 11.7892 12.9675 9.22249 12.9675H4.77749C2.21082 12.9675 1.73249 11.7775 1.60999 10.6167L1.44428 8.79384C1.40924 8.40838 1.80749 8.12779 2.16155 8.28416C2.81221 8.57154 3.72607 8.9543 4.36843 9.138C4.53174 9.1847 4.66361 9.30351 4.74436 9.45294C5.11817 10.1447 5.8659 10.5117 6.92416 10.5117C7.97209 10.5117 8.72823 10.1304 9.10379 9.43564C9.18463 9.2861 9.31674 9.16736 9.48007 9.12021C10.1665 8.92203 11.1498 8.4901 11.838 8.17058Z"
                                                                fill="#909090"/>
                                                        </svg>
                                                        <span>Position: {extractFromIdAware(salary).title}</span>
                                                    </div>
                                                </section>
                                                <section className="chart-section">
                                                    {extractFromIdAware(salary) &&
                                                        <PayDistribution salary={extractFromIdAware(salary) as Salary}
                                                                         currencySymbol={currencySymbol}
                                                                         editable={editButton}/>}
                                                </section>
                                            </div>
                                        </div>
                                        <div data-role={CollapsibleRole.Collapsible}>
                                            {showChart &&
                                                <PayExtrapolationChart salary={extractFromIdAware(salary) as Salary} theme={theme}/>}
                                        </div>
                                    </Collapsible>
                                )}
                                {!showSalary ? (
                                        <div className="title-child assigned">
                                            <span style={{paddingRight: "5%", cursor: "pointer"}} ref={listviewNotesRef}>
                                                Track Candidates
                                            </span>
                                            {
                                                !allGroupsMode ? (
                                                    <span style={{marginLeft:"475px", paddingRight: "5%", cursor: "pointer", display: "flex", alignItems:"center"}}>
                                                        Notes
                                                        <label className="notes-counter">{notes ? notes.length : 0}</label>
                                                    </span>
                                                ) : null
                                            }
                                        </div>
                                    ) : null
                                }
                                <>
                                {
                                    allGroupsMode ? (
                                        <>
                                            <div onClick={()=>setAllGroupsMode(false)} style={{cursor: "pointer", paddingLeft: "2.2%", paddingTop: "3%"}}>
                                                Go back
                                            </div>
                                            <div style={{display:"flex", alignItems:"center", paddingLeft: "2.2%", paddingTop: "2%"}}>
                                                Groups
                                                <label className="notes-counter">{customStages ? customStages.length : 0}</label>
                                            </div>
                                            <div className="stage-parents-container" style={{flexWrap:"wrap", width: "auto"}}>
                                                {customStages?.map(customStage => (
                                                    <div className="nested-childs">
                                                        <StageSwitch
                                                            key={extractFromIdAware(salary).urn}
                                                            type={StageEnum[customStage.text]}
                                                            customText={customStage.text}
                                                            urn={extractFromIdAware(salary).urn}
                                                            id={customStage?.stageId?.toString()}
                                                            activeStage={extractFromIdAware(stage).stage}
                                                            parentStage={Object.values(StageParentData).indexOf(StageParentData.GROUPS)}
                                                            parentStageName={StageParentData.GROUPS}
                                                            notes={notes}
                                                            setNotes={setNotes}
                                                            allGroupsMode={allGroupsMode}/>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                        )
                                        : (
                                        <div id="outer-container" style={{ display: "flex" }}>
                                            {
                                                showStages && !showSalary ? (
                                                    <div className="stage-parents-container stage-parents-container-border">
                                                        {stageParents.map(stageParent =>
                                                            <div className="parent-container">
                                                                <div>{stageParent.name}</div>
                                                                <div className="nested-childs">
                                                                    {stageChildData[stageParent.name]?.map?.((child,index) => stageParent.name !== StageParentData.GROUPS ?
                                                                        <StageSwitch key={extractFromIdAware(salary).urn + index}
                                                                                     type={child.name}
                                                                                     id={idInternal}
                                                                                     urn={extractFromIdAware(salary).urn}
                                                                                     parentStage={Object.values(StageParentData).indexOf(stageParent.name)}
                                                                                     parentStageName={stageParent.name}
                                                                                     activeStage={extractFromIdAware(stage).stage}
                                                                                     notes={notes}
                                                                                     setNotes={setNotes}
                                                                                     allGroupsMode={allGroupsMode}/>
                                                                        :
                                                                        <>
                                                                            {customStages?.slice(0, 3).map(customStage => (
                                                                                <StageSwitch
                                                                                    key={extractFromIdAware(salary).urn + index}
                                                                                    type={StageEnum[customStage.text]}
                                                                                    customText={customStage.text}
                                                                                    urn={extractFromIdAware(salary).urn}
                                                                                    id={customStage?.stageId?.toString()}
                                                                                    parentStage={Object.values(StageParentData).indexOf(StageParentData.GROUPS)}
                                                                                    parentStageName={StageParentData.GROUPS}
                                                                                    activeStage={extractFromIdAware(stage).stage}
                                                                                    notes={notes}
                                                                                    setNotes={setNotes}
                                                                                    allGroupsMode={allGroupsMode}/>
                                                                            ))}
                                                                            {customStages?.length > 3 && (
                                                                                <div className="create-new-group-wrapper customPill"
                                                                                     style={{cursor: "pointer"}}
                                                                                     onClick={()=>setAllGroupsMode(true)}>
                                                                                    See all ({customStages.length})
                                                                                </div>
                                                                            )}
                                                                            <CreateNewGroup />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <AssignedJobs urn={extractFromIdAware(salary).urn}/>
                                                    </div>
                                                ) : null
                                            }
                                            {showNotes && !allGroupsMode && (
                                                <>
                                                    <div className="scroll-container-parent" style={{width: "45%"}}>
                                                        <div className="scroll-container h-300" style={{height: "285px", width: "550px", paddingLeft: "26px"}}>
                                                            <div className="scroll-content">
                                                                {completed && notes?.map((n, i) => (
                                                                        <NoteCard key={i} note={n}
                                                                                  currentCount={i} totalCount={notes.length}
                                                                                  lastNoteRef={lastNoteRef}/>
                                                                    )
                                                                )}
                                                                {completed && notes.length == 0 &&
                                                                <div className="no-notes">
                                                                    <NoNotes/>
                                                                    <div>No notes yet</div>
                                                                </div>}
                                                            </div>
                                                        </div>
                                                        <div data-role={CollapsibleRole.Footer} className="footer-child">
                                                            <div className="text-input-container">
                                                                <div className="text-input">
                                                                    <input type="text" onKeyUp={onKeyUp} onChange={onChange}
                                                                           disabled={!editable}
                                                                           placeholder="Leave a note" value={text?.value}
                                                                           ref={inputRef}/>
                                                                    <div onClick={() => postNote(text?.value)}
                                                                         className={postAllowed ? "submit-allowed" : "submit-disabled"}>
                                                                        <Submit/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Credits/>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                }
                                </>
                            </NotesContainer>
                            }
                        </React.Fragment>
                    </div>
                </React.Fragment>}
        </React.Fragment>
    );
}
