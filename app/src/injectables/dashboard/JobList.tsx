import React from "react";
// @ts-ignore
import stylesheet from "./JobsList.scss";
const JobList = () => {
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="body">
                <div style={{marginTop: "10px"}}>
                    <h1 className={"booleanText"}>Jobs List</h1>
                    <div className="search-box">
                        <input type="text" placeholder="Search..." />
                        <i className="fa fa-search"></i>
                        <button className="search-btn">
                            <span className="search-btn-text">+Add a job</span>
                        </button>
                    </div>
                    <table className="table table-striped jobs-table">
                        <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Title</th>
                            <th scope="col">Salary</th>
                            <th scope="col">Company</th>
                            <th scope="col">Hiring Contact</th>
                            <th scope="col">Type</th>
                            <th scope="col">Geography</th>
                            <th scope="col">Status</th>
                            <th scope="col">Assigned</th>
                            <th scope="col">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th scope="row">1</th>
                            <td>Job Name</td>
                            <td>$100 000</td>
                            <td>Company Name</td>
                            <td>email@gmail.com</td>
                            <td>Type</td>
                            <td>Geography</td>
                            <td>Status</td>
                            <td>pic</td>
                            <td>action</td>
                        </tr>
                        <tr>
                            <th scope="row">2</th>
                            <td>Job Name</td>
                            <td>$100 000</td>
                            <td>Company Name</td>
                            <td>email@gmail.com</td>
                            <td>Type</td>
                            <td>Geography</td>
                            <td>Status</td>
                            <td>pic</td>
                            <td>action</td>
                        </tr>
                        <tr>
                            <th scope="row">3</th>
                            <td>Job Name</td>
                            <td>$100 000</td>
                            <td>Company Name</td>
                            <td>email@gmail.com</td>
                            <td>Type</td>
                            <td>Geography</td>
                            <td>Status</td>
                            <td>pic</td>
                            <td>action</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
export default JobList;
