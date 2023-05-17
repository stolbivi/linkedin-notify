import ReactDOM from "react-dom";
import JobList from "./JobList";
import Kanban from "./Kanban";
import React, {useEffect, useState} from "react";
import BooleanSearch from "./BooleanSearch";
import peopleIcon from "./images/peopleicon.png";
import searchIcon from "./images/search.png";
import bagIcon from "./images/bag.png";
// @ts-ignore
import stylesheet from "./Navbar.scss"
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../../global";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../../themes/ThemeUtils";
import {theme as LightTheme} from "../../themes/light";
import {getTheme, SwitchThemePayload} from "../../actions";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../../themes/dark";
import { useUrlChangeSupport } from "../../utils/URLChangeSupport";
import {getQuery} from "../../utils/LnDashboardHelper";
import { AccessGuard, AccessState } from "../AccessGuard";

type View = "candidates" | "jobList" | "search"

const Navbar = ({handleInit, customView} : {handleInit: Function, customView?: View}) => {
    const [view, setView] =  useState<View>('candidates');
    const messages = new MessagesV2(VERBOSE);
    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);
    const [isJobListClicked, setIsJobListClicked] = useState(false);
    const [isCandidatesClicked, setIsCandidatesClicked] = useState(true);
    const [isBooleanSearchClicked, setIsBooleanSearchClicked] = useState(false);
    const [currentUrl] = useUrlChangeSupport(window.location.href);

    useEffect(() => {
        if(!customView) return;
        setView(customView);
    }, [customView])

    useEffect(() => {
        setView(getQuery('view') as View);
    }, [currentUrl])

    useEffect(() => {
        updateView(view)
    }, [view])
    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);


    const updateView = (view: View) => {
        if(view === 'jobList') {
            jobListClickHandler();
        } else if(view === 'candidates') {
            candidatesClickHandler();
        } else if(view === 'search') {
            booleanSearchClickHandler();
        }
    }

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
        updateView(getQuery('view') as View)
    }, []);

    const renderComponent = (component: JSX.Element, jobListClicked:boolean, candidatesClicked: boolean, booleanSearchClicked: boolean) => {
        setIsJobListClicked(jobListClicked);
        setIsCandidatesClicked(candidatesClicked);
        setIsBooleanSearchClicked(booleanSearchClicked);
        if(accessState !== AccessState.Valid) return;
        
        const targetElement = document.querySelector('.lnm-dashboard-content') as HTMLElement;
        if (targetElement) {
          targetElement.style.width = 'auto';
          ReactDOM.render(component, targetElement);
        } else {
          console.warn('Target element not found.');
          handleInit();
        }
      };

      const jobListClickHandler = () => {
        renderComponent(<JobList />, true, false, false);
      };

      const candidatesClickHandler = () => {
        renderComponent(<Kanban />, false, true, false);
      };

      const booleanSearchClickHandler = () => {
        renderComponent(<BooleanSearch />, false, false, true);
      };


    const goToView = (view: View) => {
        setView(view);
        window.history.pushState({ component: view }, '', `#lndashboard?view=${view}`);
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="lnm-dashboard-navbar" ref={rootElement}>
                <button className={`navbarBtn ${isCandidatesClicked ? 'clicked' : ''}`} onClick={()=>goToView('candidates')}>
                    <img src={peopleIcon} alt="Icon" width="20" height="20" style={{marginRight:"10px"}} />
                    Candidates
                </button>
                <button className={`navbarBtn ${isJobListClicked ? 'clicked' : ''} job-list-navbar`} onClick={()=>goToView('jobList')}>
                    <img src={bagIcon} alt="Icon" width="20" height="20" style={{marginRight:"10px"}}/>
                    Jobs List
                </button>
                <button className={`navbarBtn ${isBooleanSearchClicked ? 'clicked' : ''}`} onClick={()=>goToView('search')}>
                    <img src={searchIcon} alt="Icon" width="20" height="20" style={{marginRight:"10px"}}/>
                    Boolean Search Tool
                </button>
            </div>
            <div className="navbar-access-guard-wrapper">
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px24"}
                         loaderClassName={"loader-base loader-px24"}/>
            </div>

            <div className="lnm-dashboard-content"/>
        </>
    )
}

export default Navbar;
