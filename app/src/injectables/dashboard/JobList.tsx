import React from "react";
import ReactDOM from "react-dom";
import Kanban from "./Kanban";
const JobList = () => {
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
    return (
        <>
            Job List
            <button className="btnStyle sidebarBtn"  onClick={candidatesClickHandler}>
                <img src="peopleicon.png" alt="Icon" width="20" height="20"/>
                Candidates
            </button>
            <button className="btnStyle sidebarBtn">
                <img src="search.png" alt="Icon" width="20" height="20"/>
                Boolean Search Tool
            </button>
            <button className="btnStyle sidebarBtn" onClick={jobListClickHandler}>
                <img src="bag.png" alt="Icon" width="20" height="20"/>
                Jobs List
            </button>
        </>
    )
}
export default JobList;
