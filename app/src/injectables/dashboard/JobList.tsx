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
                                            <svg width="4" style={{marginTop: "3px"}} height="7" viewBox="0 0 4 7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3.5 1L1 3.5L3.5 6" stroke="#383637" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <h3 className={"job-back-text"} onClick={() => {setIsAddMode(false);setIsEditMode(false);setDetailsView(false);}}>Jobs List</h3>
                                        </div>
                                        {detailsView ? (
                                            <span className="details-span">{title}</span>
                                        ) : (
                                            <input required={true} className={"edit-header-text"} type="text"
                                                   value={title}
                                                   readOnly={detailsView}
                                                   placeholder={isAddMode ? "Add Job Name" : "Edit Job Name"}
                                                   onChange={(event) => setTitle(event.target.value)}/>
                                        )
                                        }
                                        <div className="edit-container">
                                            <div className="edit-col">
                                                <span className="edit-col-text" style={{paddingLeft:"4px"}}>Type</span>
                                                {
                                                    detailsView ? (
                                                        <span className="details-span">{type}</span>
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
                                                        <span className="details-span">{geography}</span>
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
                                                        <span className="details-span">{company}</span>
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
                                                    <span className="details-span">{salary}</span>
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
                                                        <span className="details-span">{hiringContact}</span>
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
                                                        <span className="details-span">{status}</span>
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
                                                            <span className="details-span"> {description}</span>
                                                        ) : (
                                                            <textarea required={true} className="edit-description-input"
                                                                      value={description} readOnly={detailsView}
                                                                      placeholder="Enter Description" onChange={(event) => setDescription(event.target.value)}/>
                                                        )
                                                    }
                                                </div>
                                                {
                                                    !detailsView ? (
                                                        <div className="edit-buttons">
                                                            <button className="reset-button" onClick={resetHandler}>Reset</button>
                                                            <button className="confirm-button" type="submit" >Confirm</button>
                                                        </div>
                                                    ) : null
                                                }
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
