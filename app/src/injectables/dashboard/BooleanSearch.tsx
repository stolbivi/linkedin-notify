/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, {useEffect} from "react";
// @ts-ignore
import stylesheet from "./BooleanSearch.scss";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../../themes/ThemeUtils";
import {theme as LightTheme} from "../../themes/light";
import {getTheme, SwitchThemePayload} from "../../actions";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../../themes/dark";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../../global";

const BooleanSearch = () => {
    const messages = new MessagesV2(VERBOSE);
    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

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
            document.getElementById("formatted-results").textContent = formattedSearchQuery.replace(/\s(and|or)\s/gi, (match) => match.toUpperCase());

            const googleFormattedSearchQuery = translateToGoogleBooleanSearch(formattedSearchQuery);
            document.getElementById("google-formatted-results").textContent = googleFormattedSearchQuery.replace(/\s(and|or)\s/gi, (match) => match.toUpperCase());
        }

        const googleFormattedSearchQuery = translateToGoogleBooleanSearch(formattedSearchQuery);
        document.getElementById("google-formatted-results").textContent = googleFormattedSearchQuery.replace(/\s(and|or)\s/gi, (match) => match.toUpperCase());


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

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="body" ref={rootElement}>
                <div style={{width: "100%"}}>
                    <h1 className={"booleanText"}>Boolean Search Tool</h1>
                    <h2 className={"filterText"}>Filters</h2>
                    <p className={"descriptionText"}>
                        Need help building a candidate list on LinkedIn? We got you covered.
                        Just tell us what job titles, company names or keywords you're after
                        (or not after) in the fields below. Comma-separate them, and you're
                        good to go.
                    </p>
                    {/*<p>Jobs</p>*/}
                    {/*<div className="jobs-selection">*/}
                    {/*    <select className="jobs-dropdown">*/}
                    {/*        <option>No jobs selected</option>*/}
                    {/*    </select>*/}
                    {/*    <button>AI Keyword Generator</button>*/}
                    {/*</div>*/}
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
                            Skills to Include:
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
                            Skills to Exclude:
                        </label>
                        <input
                            style={{marginRight: "30px"}}
                            type="text"
                            id="general-keyword-exclude-input"
                            placeholder="Seperate with Comma. i.e: Macos, Mainframe"
                        />
                    </div>
                    <br/>
                    {/*<div className="preset-text">*/}
                    {/*    <p>Preset</p>*/}
                    {/*</div>*/}
                    {/*<div className="preset-selection">*/}
                    {/*    <select className="preset-dropdown">*/}
                    {/*        <option>No preset selected</option>*/}
                    {/*    </select>*/}
                    {/*    <button>Save Preset</button>*/}
                    {/*</div>*/}
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
                          ></pre>
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
