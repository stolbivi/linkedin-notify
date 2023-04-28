import React, {FormEvent, useEffect, useRef, useState} from "react";
import {NotesContainer} from "./NotesContainer";
import {Collapsible, CollapsibleRole} from "./Collapsible";
import {getSalaryValue, Salary} from "../SalaryPill";
import {PayDistribution} from "./PayDistribution";
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
import {
    createCustomStage,
    getConversationProfile,
    getCustomStages,
    getNotesByProfile,
    getSalary,
    getStages,
    getTheme,
    postNote as postNoteAction,
    ShowNotesAndChartsPayload
} from "../../actions";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
// @ts-ignore
import stylesheet from "./NotesAndCharts.scss";
import {useThemeSupport} from "../../themes/ThemeUtils";
import {theme as LightTheme} from "../../themes/light";

export const NotesAndChartsFactory = () => {
    setTimeout(() => {
        // individual profile
        if (window.location.href.indexOf("/in/") > 0) {
            const section = document.querySelectorAll('section[data-member-id]');
            if (section && section.length > 0) {
                inject(section[0].lastChild, "lnm-notes-and-charts", "after",
                    <NotesAndCharts/>, "NotesAndCharts"
                );
            }
        } else if (window.location.href.indexOf("/messaging/") > 0) {
            const section = document.getElementsByClassName("scaffold-layout__list-detail msg__list-detail");
            if (section && section.length > 0) {
                inject(section[0].lastChild, "lnm-notes-and-charts", "after",
                    <NotesAndCharts convId={"yes"}/>, "NotesAndCharts"
                );
            }
        }
        const section = document.querySelectorAll("#kanban-list-view-btn");
        if (section && section.length > 0) {
            inject(section[0].lastChild, "lnm-notes-and-charts", "after",
                <NotesAndCharts/>, "NotesAndCharts"
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
    stage?: StageEnum
    salary?: Salary
    id?: string
    convId?: string
};

export const NotesAndCharts: React.FC<Props> = ({salary, stage, id, convId}) => {

    const MAX_LENGTH = 200;

    const [showSalary, setShowSalary] = useState<boolean>(false);
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const [showStages, setShowStages] = useState<boolean>(true);
    const [show, setShow] = useState<boolean>(false);
    const [showChart, setShowChart] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false);
    const [minimized, setMinimized] = useState<boolean>(true);
    const [stageInternal, setStageInternal] = useState<StageEnum>(stage);
    const [salaryInternal, setSalaryInternal] = useState<Salary>(salary);
    const [editable, setEditable] = useState<boolean>(true);
    const [notes, setNotes] = useState<NoteExtended[]>([]);
    const [postAllowed, setPostAllowed] = useState<boolean>(false);
    const [text, setText] = useState<{ value: string }>({value: ""});
    const lastNoteRef = useRef();
    const [stageParents] = useState([...stageParentsData]);
    const [customStages, setCustomStages] = useState<UserStage[]>([]);
    const [editButton, setEditButton] = useState(false);
    const [currencySymbol, setCurrencySymbol] = useState("");
    const [salaryLabel, setSalaryLabel] = useState("");
    const [selectedTab, setSelectedTab] = useState("Track");
    const [fromListView, setFromListView] = useState(false);
    const [allGroupsMode, setAllGroupsMode] = useState(false);
    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        setSalaryLabel(salaryInternal && getSalaryValue(salaryInternal));
    },[salaryInternal]);

    useEffect(()=>{
        if (salaryLabel){
            setCurrencySymbol(salaryLabel[0]);
            if(document.querySelector(".Salary div") && document.querySelector(".Salary div").shadowRoot.querySelector(".salary-pill span")){
                (document.querySelector(".Salary div").shadowRoot.querySelector(".salary-pill span") as HTMLElement).innerText = salaryLabel;
            }
        }
    },[salaryLabel])

    const [theme, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

    useEffect(() => {
        const listener = () => {
            setShow(false);
        }
        window.addEventListener('popstate', listener);
        let profileId = extractIdFromUrl(window.location.href);
        messages.listen(createAction<ShowNotesAndChartsPayload, any>("showNotesAndCharts",
            (payload) => {
                if (id && payload?.id !== id) {
                    return Promise.resolve();
                }
                if(payload.userId) {
                    profileId = payload?.userId?.trim();
                    setCompleted(false);
                    setSalaryInternal({title:"xyz", urn: payload.profileId});
                    const notesPromise = messages.request(getNotesByProfile(payload.profileId))
                        .then((r) => setNotes(r.response))
                        .catch(e => console.error(e.error));
                    Promise.all([notesPromise]).then(() => setCompleted(true));
                    setFromListView(true);
                    setSelectedTab("Notes");
                }
                setShowNotes(payload?.showNotes)
                setShowSalary(payload?.showSalary)
                setShowStages(payload?.showStages)
                setShow(true);
                return Promise.resolve();
        }));
        // getting data
        setCompleted(false);
        if (convId) {
            messages.request(getConversationProfile(profileId))
                .then((r: any) => {
                    const entityUrns = r.participants.map((participant: any) => {
                        return participant["com.linkedin.voyager.messaging.MessagingMember"].miniProfile.entityUrn.split(":")[3];
                    });
                    messages.request(getSalary(entityUrns[0]))
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
                        Promise.all([stagePromise, notesPromise]).then(() => setCompleted(true));
                    }).catch(e => console.error(e.error));
                });
        } else {
            messages.request(getSalary(profileId))
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
        }
        return () => window.removeEventListener('popstate', listener)
    }, [window.location.href]);

    useEffect(() => {
        if (show) {
            messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
            setTimeout(() => setMinimized(false), 100);
        } else {
            setMinimized(true);
        }
    }, [show]);

    useEffect(() => {
        setPostAllowed(text && text.value.length > 0);
    }, [text]);

    const appendNote = (note: NoteExtended, tagToRemoveIndex?: number) => {
        if (typeof tagToRemoveIndex === "number" && tagToRemoveIndex !== -1) {
            let updatedNotes = [...notes,note];
            updatedNotes.splice(tagToRemoveIndex, 1);
            setNotes(updatedNotes);
        } else {
            setNotes([...notes, note]);
        }
        setTimeout(() => {
            // @ts-ignore
            lastNoteRef?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
                marginBottom: 50
            });
        }, 200);
    }

    const postNote = (text: string) => {
        if (text && text !== "") {
            text = text.slice(0, MAX_LENGTH);
            setEditable(false);
            setPostAllowed(false);
            messages.request(postNoteAction({id: salaryInternal.urn, stageTo: stageInternal, text}))
                .then((r) => {
                    if (r.error) {
                        console.error(r.error);
                    } else {
                        setText({value: ""});
                        appendNote(r.note.response);
                        setTimeout(() => {
                            // @ts-ignore
                            lastNoteRef?.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'end',
                                inline: 'nearest',
                                marginBottom: 50
                            });
                        }, 200);
                    }
                    setEditable(true);
                }).then(/* nada */);
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
        setShow(false);
        setShowChart(false);
    }

    const onExpanded = () => {
        setShowChart(true);
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
                           className={`create-new-group-wrapper ${isCreating ? "is-creating" : ""}`}>
                        {isCreating ?
                            <form onSubmit={handleCustomTagSubmit}>
                                <input value={customName}
                                       onChange={e => setCustomName(e.currentTarget.value)}
                                       placeholder='Enter New Group Here'/>
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

    const editOnClick = (event: React.MouseEvent<SVGSVGElement>) => {
        event.stopPropagation();
        setEditButton(!editButton);
    }

    useEffect(() => {
        if("Track" === selectedTab) {
            setShowStages(true);
            setShowNotes(true);
        } else {
            setShowStages(true);
            setShowNotes(true);
        }
    },[selectedTab]);

    const notesAndChartsClass = `notes-and-charts ${completed && !minimized ? 'position-expanded' : 'position-collapsed'} ${!showSalary ? 'custom-width' : ''}`;

    // @ts-ignore
    return (
        <React.Fragment>
            {show &&
                <React.Fragment>
                    <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
                    <div onTransitionEnd={() => onExpanded()}
                         className={notesAndChartsClass}
                         ref={rootElement}
                         style={{...(fromListView && { left: 'auto' }), ...(!showSalary && { width: '1000px !important' })}}>
                        <div className="close-button" onClick={() => close()}>
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L15 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                <path d="M15 2L2 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <React.Fragment>
                            <div className="local-loader"><Loader show={!completed}/></div>
                            {completed && !minimized &&
                            <NotesContainer>
                                {showSalary && (
                                    <Collapsible initialOpened={showSalary}>
                                            <div data-role={CollapsibleRole.Title} className="salary-title">
                                                <span className="salary-title-text">Avg. Base Salary (GBR)</span>
                                                <svg onClick={(event) => editOnClick(event)} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.25 17.0625H6.75C2.6775 17.0625 0.9375 15.3225 0.9375 11.25V6.75C0.9375 2.6775 2.6775 0.9375 6.75 0.9375H8.25C8.5575 0.9375 8.8125 1.1925 8.8125 1.5C8.8125 1.8075 8.5575 2.0625 8.25 2.0625H6.75C3.2925 2.0625 2.0625 3.2925 2.0625 6.75V11.25C2.0625 14.7075 3.2925 15.9375 6.75 15.9375H11.25C14.7075 15.9375 15.9375 14.7075 15.9375 11.25V9.75C15.9375 9.4425 16.1925 9.1875 16.5 9.1875C16.8075 9.1875 17.0625 9.4425 17.0625 9.75V11.25C17.0625 15.3225 15.3225 17.0625 11.25 17.0625Z" fill="#1569BF"/>
                                                    <path d="M6.375 13.2675C5.9175 13.2675 5.4975 13.1025 5.19 12.8025C4.8225 12.435 4.665 11.9025 4.7475 11.34L5.07 9.08248C5.13 8.64748 5.415 8.08498 5.7225 7.77748L11.6325 1.86748C13.125 0.374983 14.64 0.374983 16.1325 1.86748C16.95 2.68498 17.3175 3.51748 17.2425 4.34998C17.175 5.02498 16.815 5.68498 16.1325 6.35998L10.2225 12.27C9.915 12.5775 9.3525 12.8625 8.9175 12.9225L6.66 13.245C6.5625 13.2675 6.465 13.2675 6.375 13.2675ZM12.4275 2.66248L6.5175 8.57248C6.375 8.71498 6.21 9.04498 6.18 9.23998L5.8575 11.4975C5.8275 11.715 5.8725 11.895 5.985 12.0075C6.0975 12.12 6.2775 12.165 6.495 12.135L8.7525 11.8125C8.9475 11.7825 9.285 11.6175 9.42 11.475L15.33 5.56498C15.8175 5.07748 16.0725 4.64248 16.11 4.23748C16.155 3.74998 15.9 3.23248 15.33 2.65498C14.13 1.45498 13.305 1.79248 12.4275 2.66248Z" fill="#1569BF"/>
                                                    <path d="M14.8875 7.37252C14.835 7.37252 14.7825 7.36502 14.7375 7.35002C12.765 6.79502 11.1975 5.22752 10.6425 3.25502C10.56 2.95502 10.7325 2.64752 11.0325 2.55752C11.3325 2.47502 11.64 2.64752 11.7225 2.94752C12.1725 4.54502 13.44 5.81252 15.0375 6.26252C15.3375 6.34502 15.51 6.66002 15.4275 6.96002C15.36 7.21502 15.135 7.37252 14.8875 7.37252Z" fill="#1569BF"/>
                                                </svg>
                                            </div>
                                        <div data-role={CollapsibleRole.Static}>
                                            <div className="d-flex">
                                                <section className="label-section">
                                                    {
                                                        editButton
                                                            ?(<input className="label-salary-edit"
                                                                     placeholder={salaryLabel}
                                                                     onChange={(event) => setSalaryLabel(currencySymbol+event.target.value)}/>)
                                                            :(<div className="label-salary">{salaryLabel} year</div>)
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
                                                        <span>Position: {salaryInternal?.title}</span>
                                                    </div>
                                                </section>
                                                <section className="chart-section">
                                                    {salaryInternal && <PayDistribution salary={salaryInternal} currencySymbol={currencySymbol} editable={editButton}/>}
                                                </section>
                                            </div>
                                        </div>
                                        <div data-role={CollapsibleRole.Collapsible}>
                                            {showChart &&
                                                <PayExtrapolationChart salary={salaryInternal} theme={theme}/>}
                                        </div>
                                    </Collapsible>
                                )}
                                {!fromListView && !showSalary ? (
                                        <div className="title-child assigned">
                                            <span style={{paddingRight: "5%", cursor: "pointer"}} onClick={()=>setSelectedTab("Track")}>
                                                Track Candidates
                                            </span>
                                            <span style={{marginLeft:"400px", paddingRight: "5%", cursor: "pointer", display: "flex", alignItems:"center"}}
                                                  onClick={()=>setSelectedTab("Notes")}>
                                                Notes
                                                <label className="notes-counter">{notes ? notes.length : 0}</label>
                                            </span>
                                        </div>
                                    ) : null
                                }
                                {showStages &&
                                    <>
                                    {
                                        allGroupsMode ? (
                                            <>
                                                <div onClick={()=>setAllGroupsMode(false)} style={{width:"40%", cursor: "pointer", paddingLeft: "5%", paddingTop: "2%"}}>
                                                    Go back
                                                </div>
                                                <div style={{width:"40%", display:"flex", alignItems:"center", paddingLeft: "5%", paddingTop: "2%", color: "black"}}>
                                                    Groups
                                                    <label className="notes-counter">{customStages ? customStages.length : 0}</label>
                                                </div>
                                                <div className="stage-parents-container" style={{width:"40%", flexWrap:"wrap"}}>
                                                    {customStages?.map(customStage => (
                                                        <div className="nested-childs">
                                                            <StageSwitch
                                                                key={salaryInternal.urn}
                                                                type={StageEnum[customStage.text]}
                                                                activeStage={stageInternal}
                                                                parentStage={Object.values(StageParentData).indexOf(StageParentData.GROUPS)}
                                                                parentStageName={StageParentData.GROUPS}
                                                                customText={customStage.text}
                                                                classType="interested"
                                                                setStage={setStageInternal}
                                                                id={salaryInternal.urn}
                                                                appendNote={appendNote}
                                                                notes={notes}
                                                                setNotes={setNotes}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                            )
                                            : (
                                            <div id="outer-container">
                                                <div className="stage-parents-container">
                                                    {stageParents.map(stage =>
                                                        <div className="parent-container">
                                                            <div>{stage.name}</div>
                                                            <div className="nested-childs">
                                                                {stageChildData[stage.name]?.map?.((child,index) => stage.name !== StageParentData.GROUPS ?
                                                                    <StageSwitch key={salaryInternal.urn+index}
                                                                                 type={child.name}
                                                                                 activeStage={stageInternal}
                                                                                 parentStage={Object.values(StageParentData).indexOf(stage.name)}
                                                                                 parentStageName={stage.name}
                                                                                 setStage={setStageInternal} id={salaryInternal.urn}
                                                                                 appendNote={appendNote} notes={notes}
                                                                                 setNotes={setNotes}/>
                                                                    :
                                                                    <>
                                                                        {customStages?.slice(0, 4).map(customStage => (
                                                                            <StageSwitch
                                                                                key={salaryInternal.urn}
                                                                                type={StageEnum[customStage.text]}
                                                                                activeStage={stageInternal}
                                                                                parentStage={Object.values(StageParentData).indexOf(StageParentData.GROUPS)}
                                                                                parentStageName={StageParentData.GROUPS}
                                                                                customText={customStage.text}
                                                                                classType="interested"
                                                                                setStage={setStageInternal}
                                                                                id={salaryInternal.urn}
                                                                                appendNote={appendNote}
                                                                                notes={notes}
                                                                                setNotes={setNotes}
                                                                            />
                                                                        ))}
                                                                        {customStages?.length > 4 && (
                                                                            <div className="create-new-group-wrapper"
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
                                                    <div className="assigned-job">
                                                        <p>Assigned Job: </p>
                                                        <select onClick={(event)=>{event.stopPropagation()}} className="assigned-job-dropdown">
                                                            <option>Enter Job Name</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    </>
                                }
                                {showNotes && (
                                    <>
                                        {
                                            fromListView ? (
                                                <div className="title-child">
                                                    <label>Notes</label>
                                                    <label className="notes-counter">{notes ? notes.length : 0}</label>
                                                </div>
                                            ) : null
                                        }
                                        <div>
                                            <div className="scroll-container h-300">
                                                <div className="scroll-content">
                                                    {completed && notes?.map((n, i) => (
                                                        <NoteCard key={i} note={n}
                                                                  currentCount={i} totalCount={notes.length}
                                                                  lastNoteRef={lastNoteRef}/>)
                                                    )
                                                    }
                                                    {completed && notes.length == 0 &&
                                                        <div className="no-notes">
                                                            <NoNotes/>
                                                            <div>No notes yet</div>
                                                        </div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div data-role={CollapsibleRole.Footer} className="footer-child">
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
                                    </>
                                )}
                            </NotesContainer>
                            }
                        </React.Fragment>
                    </div>
                </React.Fragment>}
        </React.Fragment>
    );
}
