import React from "react";
import Navbar from "./Navbar";
// @ts-ignore
import stylesheet from "./JobsList.scss";
const JobList = () => {
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="body">
                <Navbar/>
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
                            <th scope="col">#</th>
                            <th scope="col">First</th>
                            <th scope="col">Last</th>
                            <th scope="col">Handle</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th scope="row">1</th>
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>@mdo</td>
                        </tr>
                        <tr>
                            <th scope="row">2</th>
                            <td>Jacob</td>
                            <td>Thornton</td>
                            <td>@fat</td>
                        </tr>
                        <tr>
                            <th scope="row">3</th>
                            <td>Larry</td>
                            <td>the Bird</td>
                            <td>@twitter</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
export default JobList;
