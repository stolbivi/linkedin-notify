/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, {useEffect, useRef, useState} from "react";
// @ts-ignore
import stylesheet from "./Joblist.scss";
import {MessagesV2} from "@stolbivi/pirojok";
import {Job, VERBOSE} from "../../global";
import {deleteJob, getJobs, getTheme, postJob, SwitchThemePayload, updateJob} from "../../actions";
import {Loader} from "../../components/Loader";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../../themes/ThemeUtils";
import {theme as LightTheme} from "../../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../../themes/dark";

const JobList = () => {

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



    const typesDropdown = {
        "1" : "Part-Time",
        "2" : "Full-Time",
        "3" : "Permanent",
        "4" : "Contract",
        "5" : "Freelance"
    }
    const geographyDropdown = {
        "1" : "Commute",
        "2" : "Hybrid",
        "3" : "Remote",
        "4" : "Relocation"
    }
    const statusDropdown = {
        "1" : "On Hold",
        "2" : "Actively Hiring",
        "3" : "Interviewing",
        "4" : "Filed",
        "5" : "Closed without Hire",
    }

    const [fields, setFields] = useState([]);
    const [filteredFields, setFilteredFields] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [id, setId] = useState("");
    const [title, setTitle] = useState("");
    const [type, setType] = useState("Part-Time");
    const [geography, setGeography] = useState("Commute");
    const [company, setCompany] = useState("");
    const [salary, setSalary] = useState("");
    const [hiringContact, setHiringContact] = useState("");
    const [status, setStatus] = useState("On Hold");
    const [description,setDescription] = useState("");
    const [detailsView, setDetailsView] = useState(false);

    useEffect(() => {
        messages.request(getJobs())
            .then((r) => {
                setCompleted(true);
                if(r?.error) {
                    return;
                } else {
                    // @ts-ignore
                    setFields(r.response);
                    setFilteredFields(r.response);
                }
            });
    },[]);

    useEffect(() => {
        if (searchText) {
            const searchedFields = fields.filter(field => {
                return (
                    field.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    field.salary.toLowerCase().includes(searchText.toLowerCase()) ||
                    field.company.toLowerCase().includes(searchText.toLowerCase()) ||
                    field.type.toLowerCase().includes(searchText.toLowerCase()) ||
                    field.geography.toLowerCase().includes(searchText.toLowerCase()) ||
                    field.status.toLowerCase().includes(searchText.toLowerCase())
                );
            });
            setFilteredFields(searchedFields);
        } else {
            setFilteredFields(fields);
        }
    }, [searchText]);

    const handleAddField = () => {
        setIsEditMode(false);
        setIsAddMode(true);
        resetHandler();
    };

    const handleEditField = (event,field: any) => {
        event.stopPropagation();
        setId(field.id);
        setTitle(field.title);
        setDescription(field.description);
        setSalary(field.salary);
        setType(field.type);
        setGeography(field.geography);
        setCompany(field.company);
        setHiringContact(field.hiringContact);
        setStatus(field.status);
        setIsEditMode(true);
        setIsAddMode(false);
    };
    const openDetailsView = (field) => {
        setDetailsView(true);
        setId(field.id);
        setTitle(field.title);
        setDescription(field.description);
        setSalary(field.salary);
        setType(field.type);
        setGeography(field.geography);
        setCompany(field.company);
        setHiringContact(field.hiringContact);
        setStatus(field.status);
    }
    const handleSaveField = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        let jobData: Job = {
            title,
            salary,
            company,
            hiringContact,
            type,
            geography,
            status,
            description
        }
        if(isEditMode) {
            jobData = {...jobData, id};
            setCompleted(false);
            messages.request(updateJob(jobData))
                .then((resp) => {
                    setCompleted(true);
                    setIsEditMode(false);
                    setFields((prevFields) =>
                        prevFields.map((f) => (f.id === id ? resp : f))
                    );
                    setFilteredFields((prevFields) =>
                        prevFields.map((f) => (f.id === id ? resp : f))
                    );
                });
        } else  {
            setCompleted(false);
            messages.request(postJob(jobData))
                .then((resp) => {
                    setCompleted(true);
                    setIsAddMode(false);
                    setFields([...fields, resp]);
                    setFilteredFields([...fields, resp]);
                });
        }
    };

    const handleDeleteField = (event, id: string) => {
        event.stopPropagation();
        setFields((prevFields) => prevFields.filter((field) => field.id !== id));
        setFilteredFields((prevFields) => prevFields.filter((field) => field.id !== id));
        messages.request(deleteJob(id))
            .then((_r) => {});
    };

    const resetHandler = () => {
        setType("Part-Time");
        setTitle("");
        setGeography("Commute");
        setCompany("");
        setSalary("");
        setHiringContact("");
        setStatus("On Hold");
        setDescription("");
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="body" ref={rootElement}>
                <div style={{marginTop: "10px"}}>
                    <Loader show={!completed} className="p-5 job-loader" heightValue="600px"/>
                    {
                        completed ?
                            (
                            isEditMode || isAddMode || detailsView ? (
                                <>
                                    <form onSubmit={handleSaveField}>
                                        <div style={{display: "flex"}}>
                                            <svg style={{marginTop: "3px"}} className="icon-color" width="4" height="7" viewBox="0 0 4 7" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3.5 1L1 3.5L3.5 6" stroke="#383637" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                            </svg>
                                            <h3 className={"job-back-text"} onClick={() => {setIsAddMode(false);setIsEditMode(false);setDetailsView(false);}}>Jobs List</h3>
                                        </div>
                                        {detailsView ? (
                                            <span className="details-span">{title}</span>
                                        ) : (
                                            <div style={{display: "flex"}}>
                                                <input required={true} className={"edit-header-text"} type="text"
                                                       value={title}
                                                       readOnly={detailsView}
                                                       placeholder={isAddMode ? "Add Job Name" : "Edit Job Name"}
                                                       onChange={(event) => setTitle(event.target.value)}
                                                />
                                                {
                                                    !detailsView ? (
                                                        <div className="edit-buttons">
                                                            <button className="reset-button" onClick={resetHandler}>Close</button>
                                                            <button className="confirm-button" type="submit" >Confirm</button>
                                                        </div>
                                                    ) : null
                                                }
                                            </div>
                                        )
                                        }
                                        <div className="edit-container">
                                            <div className="edit-col">
                                                <span className="edit-col-text" style={{paddingLeft:"4px"}}>Type</span>
                                                {
                                                    detailsView ? (
                                                        <div>
                                                            <svg style={{marginBottom: "5px"}} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9.03332 13.4399C8.85998 13.5133 8.67332 13.5799 8.47332 13.6466L7.41998 13.9933C4.77332 14.8466 3.37998 14.1333 2.51998 11.4866L1.66665 8.85328C0.813317 6.20661 1.51998 4.80661 4.16665 3.95328L5.19332 3.61328C5.06665 3.93328 4.95998 4.29995 4.85998 4.71328L4.20665 7.50661C3.47332 10.6466 4.54665 12.3799 7.68665 13.1266L8.80665 13.3933C8.87998 13.4133 8.95998 13.4266 9.03332 13.4399Z" fill="#909090"/>
                                                                <path d="M11.4467 2.13996L10.3334 1.87996C8.1067 1.3533 6.78004 1.78663 6.00004 3.39996C5.80004 3.80663 5.64004 4.29996 5.50671 4.86663L4.85337 7.65997C4.20004 10.4466 5.06004 11.82 7.84004 12.48L8.96004 12.7466C9.3467 12.84 9.70671 12.9 10.04 12.9266C12.12 13.1266 13.2267 12.1533 13.7867 9.74663L14.44 6.95996C15.0934 4.1733 14.24 2.7933 11.4467 2.13996Z" fill="#909090"/>
                                                            </svg>
                                                            <span className="details-span-col">{type}</span>
                                                        </div>
                                                    ) : (
                                                        <select required={true} className="edit-select" name="dropdown"
                                                                value={type}
                                                                onChange={(event) => setType(event.target.value)}>
                                                            {Object.entries(typesDropdown).map(([key, value]) => (
                                                                <option key={key} value={value}>{value}</option>
                                                            ))}
                                                        </select>
                                                    )
                                                }
                                            </div>
                                            <div className="edit-col">
                                                <span className="edit-col-text" style={{paddingLeft:"4px"}}>Geography</span>
                                                {
                                                    detailsView ? (
                                                        <div>
                                                            <svg style={{marginBottom: "5px", marginLeft: "3px", marginRight: "4px"}} width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M11.7466 4.63329C11.0466 1.55329 8.35994 0.166626 5.99994 0.166626C5.99994 0.166626 5.99994 0.166626 5.99327 0.166626C3.63994 0.166626 0.946608 1.54663 0.246608 4.62663C-0.533392 8.06663 1.57328 10.98 3.47994 12.8133C4.18661 13.4933 5.09328 13.8333 5.99994 13.8333C6.90661 13.8333 7.81328 13.4933 8.51328 12.8133C10.4199 10.98 12.5266 8.07329 11.7466 4.63329ZM5.99994 7.97329C4.83994 7.97329 3.89994 7.03329 3.89994 5.87329C3.89994 4.71329 4.83994 3.77329 5.99994 3.77329C7.15994 3.77329 8.09994 4.71329 8.09994 5.87329C8.09994 7.03329 7.15994 7.97329 5.99994 7.97329Z" fill="#909090"/>
                                                            </svg>
                                                            <span className="details-span-col">{geography}</span>
                                                        </div>
                                                    ) : (
                                                        <select required={true} className="edit-select" name="dropdown"
                                                                value={geography}
                                                                onChange={(event) => setGeography(event.target.value)}>
                                                            {Object.entries(geographyDropdown).map(([key, value]) => (
                                                                <option key={key} value={value}>{value}</option>
                                                            ))}
                                                        </select>
                                                    )
                                                }
                                            </div>
                                            <div className="edit-col">
                                                <span className="edit-col-text" style={{paddingLeft:"10px"}}>Company Name</span>
                                                {detailsView ? (
                                                    <div>
                                                        <svg style={{marginBottom: "5px", marginLeft: "8px", marginRight: "4px"}} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M14.0599 4.65339C13.4933 4.02672 12.5466 3.71339 11.1733 3.71339H11.0133V3.68672C11.0133 2.56672 11.0133 1.18005 8.50661 1.18005H7.49328C4.98661 1.18005 4.98661 2.57339 4.98661 3.68672V3.72005H4.82661C3.44661 3.72005 2.50661 4.03339 1.93994 4.66005C1.27994 5.39339 1.29994 6.38005 1.36661 7.05339L1.37328 7.10005L1.4174 7.56334C1.43166 7.71311 1.51241 7.84856 1.63857 7.93053C1.79893 8.03473 2.02015 8.17572 2.15994 8.25339C2.25328 8.31339 2.35328 8.36672 2.45328 8.42005C3.59328 9.04672 4.84661 9.46672 6.11994 9.67339C6.17994 10.3001 6.45328 11.0334 7.91328 11.0334C9.37328 11.0334 9.65994 10.3067 9.70661 9.66005C11.0666 9.44005 12.3799 8.96672 13.5666 8.27339C13.6066 8.25339 13.6333 8.23339 13.6666 8.21339C13.9104 8.07561 14.1625 7.90836 14.3964 7.74175C14.5099 7.66087 14.582 7.53464 14.5974 7.39613L14.5999 7.37339L14.6333 7.06005C14.6399 7.02005 14.6399 6.98672 14.6466 6.94005C14.6999 6.26672 14.6866 5.34672 14.0599 4.65339ZM8.72661 9.22005C8.72661 9.92672 8.72661 10.0334 7.90661 10.0334C7.08661 10.0334 7.08661 9.90672 7.08661 9.22672V8.38672H8.72661V9.22005ZM5.93994 3.71339V3.68672C5.93994 2.55339 5.93994 2.13339 7.49328 2.13339H8.50661C10.0599 2.13339 10.0599 2.56005 10.0599 3.68672V3.72005H5.93994V3.71339Z" fill="#909090"/>
                                                            <path d="M13.6456 9.28356C14.0003 9.11764 14.4077 9.39853 14.3723 9.78851L14.1601 12.1267C14.0201 13.46 13.4734 14.82 10.5401 14.82H5.46006C2.52672 14.82 1.98006 13.46 1.84006 12.1334L1.63935 9.92552C1.6043 9.54006 2.00224 9.25952 2.35586 9.41685C3.11559 9.75488 4.25608 10.2378 5.02976 10.454C5.19335 10.4997 5.32589 10.6181 5.40399 10.7689C5.82484 11.5817 6.68651 12.0134 7.91339 12.0134C9.12824 12.0134 9.99995 11.5651 10.4226 10.7492C10.5008 10.5982 10.6338 10.4798 10.7975 10.4337C11.6223 10.2013 12.8451 9.65803 13.6456 9.28356Z" fill="#909090"/>
                                                        </svg>
                                                        <span className="details-span-col">{company}</span>
                                                    </div>
                                                    ) : (
                                                        <input required={true} className="edit-input" type="text"
                                                               value={company} readOnly={detailsView}
                                                               placeholder="Company Name"
                                                               onChange={(event) => setCompany(event.target.value)}/>
                                                    )
                                                }
                                            </div>
                                            <div className="edit-col">
                                                <span className="edit-col-text" style={{paddingLeft:"10px"}}>Salary</span>
                                                {detailsView ? (
                                                    <div>
                                                        <svg style={{marginBottom: "5px", marginLeft: "9px", marginRight: "4px"}} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M9.79338 0.333374H4.20671C1.78004 0.333374 0.333374 1.78004 0.333374 4.20671V9.79338C0.333374 12.22 1.78004 13.6667 4.20671 13.6667H9.79338C12.22 13.6667 13.6667 12.22 13.6667 9.79338V4.20671C13.6667 1.78004 12.22 0.333374 9.79338 0.333374ZM8.50671 7.00004C9.02671 7.18004 9.72004 7.56004 9.72004 8.75337C9.72004 9.78004 8.92004 10.6134 7.93337 10.6134H7.50004V11C7.50004 11.2734 7.27337 11.5 7.00004 11.5C6.72671 11.5 6.50004 11.2734 6.50004 11V10.6134H6.26004C5.16671 10.6134 4.28004 9.68671 4.28004 8.55337C4.28004 8.28004 4.50004 8.05337 4.78004 8.05337C5.05337 8.05337 5.28004 8.28004 5.28004 8.55337C5.28004 9.14004 5.72004 9.61337 6.26004 9.61337H6.50004V7.35337L5.49337 7.00004C4.97337 6.82004 4.28004 6.44004 4.28004 5.24671C4.28004 4.22004 5.08004 3.38671 6.06671 3.38671H6.50004V3.00004C6.50004 2.72671 6.72671 2.50004 7.00004 2.50004C7.27337 2.50004 7.50004 2.72671 7.50004 3.00004V3.38671H7.74004C8.83337 3.38671 9.72004 4.31337 9.72004 5.44671C9.72004 5.72004 9.50004 5.94671 9.22004 5.94671C8.94671 5.94671 8.72004 5.72004 8.72004 5.44671C8.72004 4.86004 8.28004 4.38671 7.74004 4.38671H7.50004V6.64671L8.50671 7.00004Z" fill="#909090"/>
                                                        </svg>
                                                        <span className="details-span-salary-col">{salary}</span>
                                                    </div>
                                                ) : (
                                                    <input required={true} className="edit-input" type="text"
                                                           value={salary} readOnly={detailsView}
                                                           placeholder="Salary"
                                                           onChange={(event) => setSalary(event.target.value)}/>
                                                )
                                                }
                                            </div>
                                            <div className="edit-col">
                                                <span className="edit-col-text" style={{paddingLeft:"10px"}}>Hiring Contact</span>
                                                {
                                                    detailsView ? (
                                                        <span style={{marginLeft: "10px"}} className="details-span-col">{hiringContact}</span>
                                                    ) : (
                                                        <input required={true} className="edit-input" type="text" placeholder="Hiring Contact"
                                                               value={hiringContact} readOnly={detailsView}
                                                               onChange={(event) => setHiringContact(event.target.value)}/>
                                                    )
                                                }
                                            </div>
                                            <div className="edit-col">
                                                <span className="edit-col-text" style={{paddingLeft:"4px"}}>Status</span>
                                                {
                                                    detailsView ? (
                                                        <span style={{marginLeft: "4px"}} className="details-span-col">{status}</span>
                                                    ): (
                                                        <select required={true} className="edit-select" name="dropdown"
                                                                value={status}
                                                                onChange={(event) => setStatus(event.target.value)}>
                                                            {Object.entries(statusDropdown).map(([key, value]) => (
                                                                <option key={key} value={value}>{value}</option>
                                                            ))}
                                                        </select>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="edit-container-lower">
                                            <div className="edit-container-internal">
                                                <div className="edit-description">
                                                    <div className="edit-description-text">Description</div>
                                                    {
                                                        detailsView ? (
                                                            <span className="details-span-col"> {description}</span>
                                                        ) : (
                                                            <textarea required={true} className="edit-description-input"
                                                                      value={description} readOnly={detailsView}
                                                                      placeholder="Enter Description" onChange={(event) => setDescription(event.target.value)}/>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </>
                            ):(
                            <>
                                <h1 className={"booleanText"}>Jobs List</h1>
                                <div className="search-box">
                                    <input type="text" placeholder="Search..." onChange={(event) => setSearchText(event.target.value)}/>
                                    <i className="fa fa-search"/>
                                    <button className="search-btn" onClick={handleAddField}>
                                        <span className="search-btn-text">+ Add a job</span>
                                    </button>
                                </div>
                                <table className="table table-striped jobs-table table-custom">
                                    <thead>
                                    <tr>
                                        <th scope="col" className="job-column job-table-heading">Title</th>
                                        <th scope="col" className="job-column job-table-heading">Salary</th>
                                        <th scope="col" className="job-column job-table-heading">Company</th>
                                        <th scope="col" className="job-column job-table-heading">Hiring Contact</th>
                                        <th scope="col" className="job-column job-table-heading">Type</th>
                                        <th scope="col" className="job-column job-table-heading">Geography</th>
                                        <th scope="col" className="job-column job-table-heading">Status</th>
                                        <th scope="col" className="job-column job-table-heading">Assigned</th>
                                        <th scope="col" className="job-column job-table-heading">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        filteredFields?.length == 0
                                            ?  (
                                                <tr className="job-column">
                                                    <td colSpan={10}>
                                                        No Jobs Yet
                                                    </td>
                                                </tr>
                                            )
                                            :
                                            filteredFields?.map((field) => (
                                                <tr key={field.id} className="job-column job-table-row" onClick={()=>openDetailsView(field)}>
                                                    <td>
                                                        {field.title}
                                                    </td>
                                                    <td>
                                                        {field.salary}
                                                    </td>
                                                    <td>
                                                        {field.company}
                                                    </td>
                                                    <td>
                                                        {field.hiringContact}
                                                    </td>
                                                    <td>
                                                        {field.type}
                                                    </td>
                                                    <td>
                                                        {field.geography}
                                                    </td>
                                                    <td>
                                                        {field.status}
                                                    </td>
                                                    <td>
                                                        {field.assigned}
                                                    </td>
                                                    <td>
                                                        <button onClick={(event) => handleEditField(event,field)}>
                                                            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12.4917 0.666687H5.50841C2.47508 0.666687 0.666748 2.47502 0.666748 5.50835V12.4834C0.666748 15.525 2.47508 17.3334 5.50841 17.3334H12.4834C15.5167 17.3334 17.3251 15.525 17.3251 12.4917V5.50835C17.3334 2.47502 15.5251 0.666687 12.4917 0.666687ZM8.12508 13.5917C7.88341 13.8334 7.42508 14.0667 7.09175 14.1167L5.04175 14.4084C4.96675 14.4167 4.89175 14.425 4.81675 14.425C4.47508 14.425 4.15841 14.3084 3.93341 14.0834C3.65841 13.8084 3.54175 13.4084 3.60841 12.9667L3.90008 10.9167C3.95008 10.575 4.17508 10.125 4.42508 9.88335L8.14175 6.16669C8.20841 6.34169 8.27508 6.51669 8.36675 6.71669C8.45008 6.89169 8.54175 7.07502 8.64175 7.24169C8.72508 7.38335 8.81675 7.51669 8.89175 7.61669C8.98341 7.75835 9.09175 7.89169 9.15841 7.96669C9.20008 8.02502 9.23341 8.06669 9.25008 8.08335C9.45842 8.33335 9.70008 8.56669 9.90841 8.74169C9.96675 8.80002 10.0001 8.83335 10.0167 8.84169C10.1417 8.94169 10.2667 9.04169 10.3751 9.11669C10.5084 9.21669 10.6417 9.30835 10.7834 9.38335C10.9501 9.48335 11.1334 9.57502 11.3167 9.66669C11.5084 9.75002 11.6834 9.82502 11.8584 9.88335L8.12508 13.5917ZM13.4751 8.24169L12.7084 9.01669C12.6584 9.06669 12.5917 9.09169 12.5251 9.09169C12.5001 9.09169 12.4667 9.09169 12.4501 9.08335C10.7584 8.60002 9.40841 7.25002 8.92508 5.55835C8.90008 5.46669 8.92508 5.36669 8.99175 5.30835L9.76675 4.53335C11.0334 3.26669 12.2417 3.29169 13.4834 4.53335C14.1167 5.16669 14.4251 5.77502 14.4251 6.40835C14.4167 7.00835 14.1084 7.60835 13.4751 8.24169Z" fill="#909090"/>
                                                            </svg>
                                                        </button>
                                                        <button onClick={(event) => handleDeleteField(event,field.id)}>
                                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M17.5584 4.35835C16.2167 4.22502 14.875 4.12502 13.525 4.05002V4.04169L13.3417 2.95835C13.2167 2.19169 13.0334 1.04169 11.0834 1.04169H8.90005C6.95838 1.04169 6.77505 2.14169 6.64172 2.95002L6.46672 4.01669C5.69172 4.06669 4.91672 4.11669 4.14172 4.19169L2.44172 4.35835C2.09172 4.39169 1.84172 4.70002 1.87505 5.04169C1.90838 5.38335 2.20838 5.63335 2.55838 5.60002L4.25838 5.43335C8.62505 5.00002 13.0251 5.16669 17.4417 5.60835C17.4667 5.60835 17.4834 5.60835 17.5084 5.60835C17.8251 5.60835 18.1 5.36669 18.1334 5.04169C18.1584 4.70002 17.9084 4.39169 17.5584 4.35835Z" fill="#909090"/>
                                                                <path d="M16.025 6.78331C15.825 6.57498 15.55 6.45831 15.2666 6.45831H4.73329C4.44995 6.45831 4.16662 6.57498 3.97495 6.78331C3.78329 6.99165 3.67495 7.27498 3.69162 7.56665L4.20829 16.1166C4.29995 17.3833 4.41662 18.9666 7.32495 18.9666H12.675C15.5833 18.9666 15.7 17.3916 15.7916 16.1166L16.3083 7.57498C16.325 7.27498 16.2166 6.99165 16.025 6.78331ZM11.3833 14.7916H8.60829C8.26662 14.7916 7.98329 14.5083 7.98329 14.1666C7.98329 13.825 8.26662 13.5416 8.60829 13.5416H11.3833C11.725 13.5416 12.0083 13.825 12.0083 14.1666C12.0083 14.5083 11.725 14.7916 11.3833 14.7916ZM12.0833 11.4583H7.91662C7.57495 11.4583 7.29162 11.175 7.29162 10.8333C7.29162 10.4916 7.57495 10.2083 7.91662 10.2083H12.0833C12.425 10.2083 12.7083 10.4916 12.7083 10.8333C12.7083 11.175 12.425 11.4583 12.0833 11.4583Z" fill="#909090"/>
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    }
                                    </tbody>
                                </table>
                            </>
                        )
                        ) : null
                    }
                </div>
            </div>
        </>
    );
}
export default JobList;
