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
import {useUrlChangeSupport} from "../../utils/URLChangeSupport";

const Navbar = () => {

    const messages = new MessagesV2(VERBOSE);
    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);
    const [isJobListClicked, setIsJobListClicked] = useState(false);
    const [isCandidatesClicked, setIsCandidatesClicked] = useState(true);
    const [isBooleanSearchClicked, setIsBooleanSearchClicked] = useState(false);
    const [urlInternal] = useUrlChangeSupport(window.location.href);

    useEffect(() => {
        if (window.location.href.indexOf("/lndashboard/") < 0) {
            window.location.reload();
        }
    }, [urlInternal]);

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

    const jobListClickHandler = () => {
        const targetElement = document.querySelector('.lnm-dashboard-content') as HTMLElement;
        if (targetElement) {
            targetElement.style.width = 'auto';
            ReactDOM.render(<JobList />, targetElement);
            setIsJobListClicked(true);
            setIsCandidatesClicked(false);
            setIsBooleanSearchClicked(false);
            sessionStorage.removeItem("isListView")
        } else {
            console.warn('Target element not found.');
        }
    }

    const candidatesClickHandler = () => {
        const targetElement = document.querySelector('.lnm-dashboard-content') as HTMLElement;
        if (targetElement) {
            targetElement.style.width = 'auto';
            ReactDOM.render(<Kanban />, targetElement);
            setIsJobListClicked(false);
            setIsCandidatesClicked(true);
            setIsBooleanSearchClicked(false);
        } else {
            console.warn('Target element not found.');
        }
    }

    const booleanSearchClickHandler = () => {
        const targetElement = document.querySelector('.lnm-dashboard-content') as HTMLElement;
        if (targetElement) {
            targetElement.style.width = 'auto';
            ReactDOM.render(<BooleanSearch />, targetElement);
            setIsJobListClicked(false);
            setIsCandidatesClicked(false);
            setIsBooleanSearchClicked(true);
        } else {
            console.warn('Target element not found.');
        }
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="lnm-dashboard-navbar" ref={rootElement}>
                <button className={`navbarBtn ${isCandidatesClicked ? 'clicked' : ''}`} onClick={candidatesClickHandler}>
                    <img src={peopleIcon} alt="Icon" width="20" height="20" style={{marginRight:"10px"}} />
                    Candidates
                </button>
                <button className={`navbarBtn ${isJobListClicked ? 'clicked' : ''} job-list-navbar`} onClick={jobListClickHandler}>
                    <img src={bagIcon} alt="Icon" width="20" height="20" style={{marginRight:"10px"}}/>
                    Jobs List
                </button>
                <button className={`navbarBtn ${isBooleanSearchClicked ? 'clicked' : ''}`} onClick={booleanSearchClickHandler}>
                    <img src={searchIcon} alt="Icon" width="20" height="20" style={{marginRight:"10px"}}/>
                    Boolean Search Tool
                </button>
            </div>
            <div className="lnm-dashboard-content"/>
        </>
    )
}

export default Navbar;
