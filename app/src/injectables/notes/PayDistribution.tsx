import React, { useEffect, useState } from "react";
import { Salary } from "../SalaryPill";

import "./PayDistribution.scss";

type Props = {
    salary: Salary;
};

interface Sample {
    percent: number;
    value: string;
}

interface Distribution {
    left: Sample;
    middle: Sample;
    right: Sample;
}

export const PayDistribution: React.FC<Props> = ({ salary }) => {
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const [distribution, setDistribution] = useState<Distribution>({
        left: {percent: 10, value: ""},
        middle: {percent: 80, value: ""},
        right: {percent: 10, value: ""},
    });

    const formatPercent = (percent: number) =>
        percent && percent.toFixed(0) + "%";

    useEffect(() => {
        console.log("Salary: ", salary);

        function formatValue(value: number) {
            return `${salary.symbol}${Number(value / 1000).toFixed(0)}K`;
        }

        if (salary.payDistribution && salary.payDistributionValues) {
            setDistribution({
                left: {
                    percent: 10,
                    value: salary.payDistribution[0],
                },
                middle: {
                    percent: 80,
                    value: formatValue(
                        (salary.payDistributionValues[0] +
                            salary.payDistributionValues[3]) /
                        2
                    ),
                },
                right: {
                    percent: 10,
                    value: salary.payDistribution[3],
                },
            });
        }
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const newDistribution = {...distribution};
        newDistribution[key].value = event.target.value;
        setDistribution(newDistribution);
    };

    const handleEdit = () => {
        setIsEditable(!isEditable);
    };

    return (
        <React.Fragment>
            <div className="bar-container">
                <div className="bar-left" style={{width: distribution?.left?.percent + "%"}}>
                    <React.Fragment>
                        {isEditable ? (
                                <input
                                    className="input-field"
                                    type="text"
                                    value={distribution?.left?.value}
                                    onChange={(e) => handleChange(e, "left")}
                                />
                        ) : (
                                <span>{distribution?.left?.value}</span>
                        )}
                        <span>{formatPercent(10)}</span>
                        <div className="bar-line"/>
                    </React.Fragment>
                </div>
                <div className="bar-middle">
                    <React.Fragment>
                        {isEditable ? (
                            <input
                                className="input-field"
                                type="text"
                                value={distribution?.middle?.value}
                                onChange={(e) => handleChange(e, "left")}
                            />
                        ) : (
                            <span>{distribution?.middle?.value}</span>
                        )}
                        <span>{formatPercent(10)}</span>
                        <div className="bar-line"/>
                    </React.Fragment>
                </div>
                <div className="bar-right" style={{width: distribution?.right?.percent + "%"}}>
                    <React.Fragment>
                        {isEditable ? (
                            <input
                                className="input-field"
                                type="text"
                                value={distribution?.right?.value}
                                onChange={(e) => handleChange(e, "left")}
                            />
                        ) : (
                            <span>{distribution?.right?.value}</span>
                        )}
                        <span>{formatPercent(10)}</span>
                        <div className="bar-line"/>
                    </React.Fragment>
                </div>
            </div>
            <button onClick={handleEdit}>{isEditable ? "Save" : "Edit"}</button>
        </React.Fragment>
    );
}
