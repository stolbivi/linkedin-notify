import React, {useEffect, useState} from "react";
import {assignJob, getAssignedJob, getJobs} from "../actions";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
// @ts-ignore
import stylesheet from "./AssignedJobs.scss";
import {Loader} from "./Loader";

const AssignedJobs = (props: { urn: any; }) => {
    const [jobs,setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const messages = new MessagesV2(VERBOSE);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        messages.request(getAssignedJob({url: extractIdFromUrl(window.location.href)}))
            .then((r) => {
                setSelectedJob(r?.jobId);
            });
        messages.request(getJobs())
            .then((r) => {
                if(r?.error) {
                    return;
                } else {
                    setCompleted(true);
                    setJobs(r.response);
                }
            });
        },[]);

    const assignJobHandler = (jobId: string) => {
        setCompleted(false);
        messages.request(assignJob({jobId: jobId, urn: props.urn})).then(resp => {
            setCompleted(true);
            setSelectedJob(resp.jobId);
        })
    }

    return(
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="assigned-job">
                <p>Assigned Job: </p>
                {
                    completed ? (
                        <select
                            value={selectedJob}
                            onChange={(event)=>{assignJobHandler(event.target.value)}}
                            className="assigned-job-dropdown">
                            <option>Select Job Name</option>
                            {
                                jobs?.map(job => (
                                    <option className="assigned-job-options" key={job.id} value={job.id}>
                                        {job.title}
                                    </option>
                                ))
                            }
                        </select>
                    ) : <Loader show={!completed} className="assigned-job-loader"/>
                }
            </div>
        </>
    )
}
export default AssignedJobs;