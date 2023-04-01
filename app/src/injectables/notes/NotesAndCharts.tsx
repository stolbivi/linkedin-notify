import React, {useEffect, useState} from "react";
import {NotesContainer} from "./NotesContainer";
import {Collapsible, CollapsibleRole} from "./Collapsible";
import {getSalaryValue, Salary} from "../SalaryPill";
import {PayDistribution} from "./PayDistribution";
import {StageEnum, StageSwitch} from "./StageSwitch";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, NoteExtended, VERBOSE} from "../../global";
import {inject} from "../../utils/InjectHelper";
import {Loader} from "../../components/Loader";
import {NoteCard} from "./NoteCard";
import {PayExtrapolationChart} from "./PayExtrapolationChart";
import {Credits} from "../Credits";
import {Submit} from "../../icons/Submit";
import {NoNotes} from "../../icons/NoNotes";
import {
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
                    <NotesAndCharts/>
                );
            }
        }
        if (window.location.href.indexOf("/messaging/") > 0) {
            const section = document.querySelectorAll('#global-nav');
            if (section && section.length > 0) {
                inject(section[0].lastChild, "lnm-notes-and-charts", "after",
                    <NotesAndCharts convId={sessionStorage.getItem("prf")}/>
                );
            }
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
                                <NotesAndCharts id={id}/>
                            );
                        }
                    }
                })
            }
        }
    },500);
}

type Props = {
    stage?: StageEnum
    salary?: Salary
    id?: string
    convId?:string
};


export const NotesAndCharts: React.FC<Props> = ({salary, stage, id,convId}) => {

    const MAX_LENGTH = 200;

    const [showSalary, setShowSalary] = useState<boolean>(false);
    const [showNotes, setShowNotes] = useState<boolean>(false);
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

    const messages = new MessagesV2(VERBOSE);

    const [theme, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

    useEffect(() => {
        window.addEventListener('popstate', () => {
            setShow(false);
        });
        messages.listen(createAction<ShowNotesAndChartsPayload, any>("showNotesAndCharts",
            (payload) => {
                if (id && payload?.id !== id) {
                    return Promise.resolve();
                }
                setShowNotes(payload?.showNotes)
                setShowSalary(payload?.showSalary)
                setShow(true);
                return Promise.resolve();
            }));
        // getting data
        setCompleted(false);
        let prfId = extractIdFromUrl(window.location.href);
        if(convId) {
            prfId = convId;
        }
        messages.request(getSalary(prfId))
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
    }, []);

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

    const appendNote = (note: NoteExtended) => {
        setNotes([...notes, note]);
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
                        appendNote(r.note.response)
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

    return (
        <React.Fragment>
            {show &&
                <React.Fragment>
                    <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
                    <div onTransitionEnd={() => onExpanded()}
                         className={"notes-and-charts " + ((completed && !minimized) ? "position-expanded" : "position-collapsed")}
                         ref={rootElement}>
                        <div className="close-button" onClick={() => close()}>
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L15 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                <path d="M15 2L2 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <React.Fragment>
                            <div className="local-loader"><Loader show={!completed}/></div>
                            {completed && !minimized && <NotesContainer>
                                <Collapsible initialOpened={showSalary}>
                                    <div data-role={CollapsibleRole.Title}>Avg. Base Salary (GBR)</div>
                                    <div data-role={CollapsibleRole.Static}>
                                        <div className="d-flex">
                                            <section className="label-section">
                                                <div
                                                    className="label-salary">{salaryInternal && getSalaryValue(salaryInternal)} year
                                                </div>
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
                                                {salaryInternal && <PayDistribution salary={salaryInternal}/>}
                                            </section>
                                        </div>
                                    </div>
                                    <div data-role={CollapsibleRole.Collapsible}>
                                        {showChart && <PayExtrapolationChart salary={salaryInternal} theme={theme}/>}
                                    </div>
                                </Collapsible>
                                {salaryInternal &&
                                    <div className="stage-container">
                                        <span>Pick a stage</span>
                                        <div className="stages">
                                            <StageSwitch type={StageEnum.Interested} activeStage={stageInternal}
                                                         setStage={setStageInternal}
                                                         id={salaryInternal.urn} appendNote={appendNote}/>
                                            <StageSwitch type={StageEnum.NotInterested} activeStage={stageInternal}
                                                         setStage={setStageInternal}
                                                         id={salaryInternal.urn} appendNote={appendNote}/>
                                            <StageSwitch type={StageEnum.Interviewing} activeStage={stageInternal}
                                                         setStage={setStageInternal}
                                                         id={salaryInternal.urn} appendNote={appendNote}/>
                                            <StageSwitch type={StageEnum.FailedInterview} activeStage={stageInternal}
                                                         setStage={setStageInternal} id={salaryInternal.urn}
                                                         appendNote={appendNote}/>
                                            <StageSwitch type={StageEnum.Hired} activeStage={stageInternal}
                                                         setStage={setStageInternal}
                                                         id={salaryInternal.urn} appendNote={appendNote}/>
                                        </div>
                                    </div>}
                                <Collapsible initialOpened={showNotes}>
                                    <div data-role={CollapsibleRole.Title} className="title-child">
                                        <label>Notes</label>
                                        <label className="notes-counter">{notes ? notes.length : 0}</label>
                                    </div>
                                    <div data-role={CollapsibleRole.Collapsible}>
                                        <div className="scroll-container h-300">
                                            <div className="scroll-content">
                                                {completed && notes?.map((n, i) => (
                                                    <NoteCard key={i} note={n}/>))}
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
                                </Collapsible>
                            </NotesContainer>}
                        </React.Fragment>
                    </div>
                </React.Fragment>}
        </React.Fragment>
    );
}