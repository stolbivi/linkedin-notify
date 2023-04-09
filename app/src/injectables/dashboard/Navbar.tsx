import ReactDOM from "react-dom";
import JobList from "./JobList";
import Kanban from "./Kanban";
import React, { useState } from "react";
import BooleanSearch from "./BooleanSearch";
import peopleIcon from "./images/peopleicon.png";
import searchIcon from "./images/search.png";
import bagIcon from "./images/bag.png";

const Navbar = () => {
    const [isJobListClicked, setIsJobListClicked] = useState(false);
    const [isCandidatesClicked, setIsCandidatesClicked] = useState(false);
    const [isBooleanSearchClicked, setIsBooleanSearchClicked] = useState(false);

    const jobListClickHandler = () => {
        const targetElement = document.querySelector('.scaffold-layout__inner.scaffold-layout-container.scaffold-layout-container--reflow') as HTMLElement;
        if (targetElement) {
            targetElement.style.width = 'auto';
            ReactDOM.render(<JobList />, targetElement);
            setIsJobListClicked(true);
            setIsCandidatesClicked(false);
            setIsBooleanSearchClicked(false);
        } else {
            console.warn('Target element not found.');
        }
    }

    const candidatesClickHandler = () => {
        const targetElement = document.querySelector('.scaffold-layout__inner.scaffold-layout-container.scaffold-layout-container--reflow') as HTMLElement;
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
        const targetElement = document.querySelector('.scaffold-layout__inner.scaffold-layout-container.scaffold-layout-container--reflow') as HTMLElement;
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
            <button className={`navbarBtn ${isCandidatesClicked ? 'clicked' : ''}`} onClick={candidatesClickHandler}>
                <img src={peopleIcon} alt="Icon" width="20" height="20"/>
                Candidates
            </button>
            <button className={`navbarBtn ${isBooleanSearchClicked ? 'clicked' : ''}`} onClick={booleanSearchClickHandler}>
                <img src={searchIcon} alt="Icon" width="20" height="20"/>
                Boolean Search Tool
            </button>
            <button className={`navbarBtn ${isJobListClicked ? 'clicked' : ''}`} onClick={jobListClickHandler}>
                <img src={bagIcon} alt="Icon" width="20" height="20"/>
                Jobs List
            </button>
        </>
    )
}

export default Navbar;
