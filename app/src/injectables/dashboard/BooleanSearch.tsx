/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, {useEffect} from "react";
// @ts-ignore
import stylesheet from "./BooleanSearch.scss";
import ReactDOM from "react-dom";
import JobList from "./JobList";
import Kanban from "./Kanban";

const BooleanSearch = () => {
    function translateToGoogleBooleanSearch(linkedinQuery: string) {
        const querySegments = linkedinQuery.match(/(\(.*?\))|(-\w+)|(\w+)/g);
        let googleQuery = "";

        for (let i = 0; i < querySegments.length; i++) {
            const segment = querySegments[i];
            if (segment.startsWith("(")) {
                googleQuery += " " + segment;
            } else if (segment.startsWith("-")) {
                googleQuery += " -" + segment.slice(1);
            } else {
                googleQuery += " " + segment;
            }
        }

        googleQuery = googleQuery.replace(/title:/g, 'intitle:');
        googleQuery = googleQuery.replace(/company:/g, 'intext:');
        googleQuery = googleQuery.replace(/\(|\)/g, '');
        googleQuery = googleQuery.replace(/ AND /g, ' and ');

        return googleQuery.trim();
    }


    function searchOnGoogle() {
        const googleFormattedQuery = document.getElementById("google-formatted-results").textContent;
        const googleUrl = "https://www.google.com/search";
        const linkedinSite = "site:linkedin.com/in";
        const encodedQuery = encodeURIComponent(`${linkedinSite} ${googleFormattedQuery}`);
        window.open(`${googleUrl}?q=${encodedQuery}`, '_blank');
    }

    function formatResults() {
        const jobTitleInput = document.getElementById("job-title-input").value;
        const excludeJobTitleInput = document.getElementById("exclude-job-title-input").value;
        const companyIncludeInput = document.getElementById("company-include-input").value;
        const companyExcludeInput = document.getElementById("company-exclude-input").value;
        const generalKeywordIncludeInput = document.getElementById("general-keyword-include-input").value;
        const generalKeywordExcludeInput = document.getElementById("general-keyword-exclude-input").value;
        if (jobTitleInput === "" && excludeJobTitleInput === "" && companyIncludeInput === "" && companyExcludeInput === "" && generalKeywordIncludeInput === "" && generalKeywordExcludeInput === "") {
            document.getElementById("formatted-results").textContent = "";
            document.getElementById("google-formatted-results").textContent = "";
        } else {
            const formattedSearchQuery = formatSearchQuery(jobTitleInput, excludeJobTitleInput, companyIncludeInput, companyExcludeInput, generalKeywordIncludeInput, generalKeywordExcludeInput);
            document.getElementById("formatted-results").textContent = formattedSearchQuery.toLowerCase();

            const googleFormattedSearchQuery = translateToGoogleBooleanSearch(formattedSearchQuery);
            document.getElementById("google-formatted-results").textContent = googleFormattedSearchQuery.toLowerCase();
        }

        const googleFormattedSearchQuery = translateToGoogleBooleanSearch(formattedSearchQuery);
        document.getElementById("google-formatted-results").textContent = googleFormattedSearchQuery.toLowerCase();


    }

    function formatSearchQuery(includeTitle, excludeTitle, includeCompany, excludeCompany, includeGeneral, excludeGeneral) {
        const formattedJobTitles = includeTitle || excludeTitle ? formatTitles("title", includeTitle, excludeTitle) : "";
        const formattedCompanies = includeCompany || excludeCompany ? formatTitles("company", includeCompany, excludeCompany) : "";
        const formattedGeneralKeywords = includeGeneral || excludeGeneral ? formatTitles("", includeGeneral, excludeGeneral) : "";
        return `${formattedJobTitles}${formattedCompanies}${formattedGeneralKeywords}`.trim();
    }
    function formatTitles(prefix, include, exclude) {
        const includeItems = include.split(/\s+(AND|OR)\s+/i).map((t) => t.trim());
        const excludeItems = exclude ? exclude.split(',').map((t) => t.trim()) : []; // Only split exclude if it is not empty
        let formattedItems = "";
        // Format include items
        if (includeItems.length > 0 && includeItems[0] !== "") { // Check if includeItems is not empty before adding the opening parenthesis
            formattedItems += "(";
            for (let i = 0; i < includeItems.length; i++) {
                const t = includeItems[i];
                let formattedItem = t;

                if (/\s/.test(t) && !/\b(AND|OR)\b/i.test(t)) {
                    formattedItem = `"${t}"`;
                }

                if (prefix) {
                    formattedItems += `${prefix}:${formattedItem}`;
                } else {
                    formattedItems += `${formattedItem}`;
                }

                if (i < includeItems.length - 1) {
                    if (/\b(AND|OR)\b/i.test(includeItems[i + 1])) {
                        formattedItems += ` ${includeItems[i + 1].toUpperCase()} `;
                        i++;
                    } else {
                        formattedItems += " AND "; // Changed this line from "OR" to "AND"
                    }
                }
            }
            formattedItems += ")";
        }
        // Format exclude items
        if (excludeItems.length > 0) {
            formattedItems += "(";
            for (let i = 0; i < excludeItems.length; i++) {
                const t = excludeItems[i];
                if (t !== "") { // Only process non-empty strings
                    let formattedItem = t;

                    if (/\s/.test(t) && !/\b(AND|OR)\b/i.test(t)) {
                        formattedItem = `"${t}"`;
                    }

                    if (prefix) {
                        formattedItems += `-${prefix}:${formattedItem}`;
                    } else {
                        formattedItems += `-${formattedItem}`;
                    }

                    if (i < excludeItems.length - 1) {
                        formattedItems += " "; // Changed this line from the previous logic to add space instead of OR
                    }
                }
            }
            formattedItems += ")";
        }

        return formattedItems.replace(/,/g, ' ');
    }

    function searchOnLinkedin() {
        const formattedQuery = document.getElementById("formatted-results").textContent;
        const linkedinUrl = "https://www.linkedin.com/search/results/people/";
        const encodedQuery = encodeURIComponent(formattedQuery);
        window.open(`${linkedinUrl}?keywords=${encodedQuery}`, '_blank');
    }

    useEffect(() => {
        document.getElementById("job-title-input").addEventListener("input", formatResults);
        document.getElementById("exclude-job-title-input").addEventListener("input", formatResults);
        document.getElementById("company-include-input").addEventListener("input", formatResults);
        document.getElementById("company-exclude-input").addEventListener("input", formatResults);
        document.getElementById("general-keyword-include-input").addEventListener("input", formatResults);
        document.getElementById("general-keyword-exclude-input").addEventListener("input", formatResults);
        document.getElementById("linkedin-search-button").addEventListener("click", searchOnLinkedin);
        document.getElementById("google-search-button").addEventListener("click", searchOnGoogle);
    }, []);


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
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="body">
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
                <div style={{width: "70rem"}}>
                    <h1>Boolean Search Tool</h1>
                    <h2>Filters</h2>
                    <p>
                        Need help building a candidate list on LinkedIn? We got you covered.
                        Just tell us what job titles, company names or keywords you're after
                        (or not after) in the fields below. Comma-separate them, and you're
                        good to go.
                    </p>
                    <div className="queryContainers">
                        <label htmlFor="job-title-input">Job Titles to Include:</label>
                        <input
                            className={"booleanInput"}
                            type="text"
                            id="job-title-input"
                            placeholder="Use AND or OR. i.e: Software Engineer AND Data Scientist"
                        />
                    </div>
                    <div className="queryContainers">
                        <label htmlFor="exclude-job-title-input">
                            Job Titles to Exclude:
                        </label>
                        <input
                            style={{marginRight: "30px"}}
                            type="text"
                            id="exclude-job-title-input"
                            placeholder="Seperate with Comma. i.e: Frontend Developer, Javascript Developer"
                        />
                        <span
                            id="exclude-job-title-error"
                            style={{color: "red", display: "none"}}
                        >
                        Please do not use AND or OR in the "Job Titles to Exclude" field.
                      </span>
                    </div>
                    <div className="queryContainers">
                        <label htmlFor="company-include-input">Companies to Include:</label>
                        <input
                            style={{marginRight: "30px"}}
                            type="text"
                            id="company-include-input"
                            placeholder="Use AND or OR. i.e: Apple OR Google"
                        />
                    </div>
                    <div className="queryContainers">
                        <label htmlFor="company-exclude-input">Companies to Exclude:</label>
                        <input
                            style={{marginRight: "30px"}}
                            type="text"
                            id="company-exclude-input"
                            placeholder="Seperate with Comma. i.e: Facebook, GM"
                        />
                    </div>
                    <div className="queryContainers">
                        <label htmlFor="general-keyword-include-input">
                            General Keywords to Include:
                        </label>
                        <input
                            style={{marginRight: "30px"}}
                            type="text"
                            id="general-keyword-include-input"
                            placeholder="Use AND or OR. i.e: Java AND Python"
                        />
                    </div>
                    <div className="queryContainers">
                        <label htmlFor="general-keyword-exclude-input">
                            General Keywords to Exclude:
                        </label>
                        <input
                            style={{marginRight: "30px"}}
                            type="text"
                            id="general-keyword-exclude-input"
                            placeholder="Seperate with Comma. i.e: Macos, Mainframe"
                        />
                    </div>
                    <br/>
                    <h2>Custom Search</h2>
                    <p>
                        Use the LinkedIn or Google buttons to search for candidates using the
                        generated boolean strings below.
                    </p>
                    <div className="queryContainers">
                      <pre
                          id="formatted-results"
                          contentEditable="true"
                          placeholder="Boolean search string will appear here"
                      />
                        <button
                            style={{width: "20%", marginRight: "20px", cursor: "pointer"}}
                            id="linkedin-search-button"
                        >
                            Linkedin Search
                        </button>
                    </div>
                    <div className="queryContainers">
                          <pre
                              id="google-formatted-results"
                              contentEditable="true"
                              placeholder="Boolean search string will appear here"
                          />
                        <button
                            style={{width: "20%", marginRight: "20px", cursor: "pointer"}}
                            id="google-search-button"
                        >
                            Google Search
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default BooleanSearch;