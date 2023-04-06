import React from "react";
import Navbar from "./Navbar";
// @ts-ignore
import stylesheet from "./BooleanSearch.scss";
const JobList = () => {
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="body">
                <Navbar/>
                <div style={{marginTop: "10%"}}>
                    Job List
                </div>
            </div>
        </>
    )
}
export default JobList;
