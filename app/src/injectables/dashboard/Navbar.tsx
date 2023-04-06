import ReactDOM from "react-dom";
import JobList from "./JobList";
import Kanban from "./Kanban";
import React from "react";
import BooleanSearch from "./BooleanSearch";
import peopleIcon from "./images/peopleicon.png";
import searchIcon from "./images/search.png";
import bagIcon from "./images/bag.png";

const Navbar = () => {
    const jobListClickHandler = () => {
        const targetElement = document.querySelector('.scaffold-layout__inner.scaffold-layout-container.scaffold-layout-container--reflow');
        if (targetElement) {
            ReactDOM.render(<JobList />, targetElement);
        } else {
            console.warn('Target element not found.');
        }
    }
    const candidatesClickHandler = () => {
        const targetElement = document.querySelector('.scaffold-layout__inner.scaffold-layout-container.scaffold-layout-container--reflow');
        if (targetElement) {
            ReactDOM.render(<Kanban />, targetElement);
        } else {
            console.warn('Target element not found.');
        }
    }
    const booleanSearchClickHandler = () => {
        const targetElement = document.querySelector('.scaffold-layout__inner.scaffold-layout-container.scaffold-layout-container--reflow');
        if (targetElement) {
            ReactDOM.render(<BooleanSearch />, targetElement);
        } else {
            console.warn('Target element not found.');
        }
    }
    return (
        <>
            <button className="btnStyle sidebarBtn" onClick={candidatesClickHandler}>
                <img src={peopleIcon} alt="Icon" width="20" height="20"/>
                Candidates
            </button>
            <button className="btnStyle sidebarBtn" onClick={booleanSearchClickHandler}>
                <img src={searchIcon} alt="Icon" width="20" height="20"/>
                Boolean Search Tool
            </button>
            <button className="btnStyle sidebarBtn" onClick={jobListClickHandler}>
                <img src={bagIcon} alt="Icon" width="20" height="20"/>
                Jobs List
            </button>
        </>
    )
}
export default Navbar;