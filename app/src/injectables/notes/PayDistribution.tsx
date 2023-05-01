import React, {useEffect, useState} from "react";
import {Salary} from "../../store/SalaryReducer";

import "./PayDistribution.scss";

type Props = {
    salary: Salary;
    editable: boolean;
    currencySymbol: String;
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

export const PayDistribution: React.FC<Props> = ({ salary , currencySymbol,editable}) => {
    const [distribution, setDistribution] = useState<Distribution>({
        left: {percent: 10, value: ""},
        middle: {percent: 80, value: ""},
        right: {percent: 10, value: ""},
    });

    const formatPercent = (percent: number) =>
        percent && percent.toFixed(0) + "%";

    useEffect(() => {
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
        // @ts-ignore
        newDistribution[key].value = currencySymbol+event.target.value;
        setDistribution(newDistribution);
    };

    return (
        <React.Fragment>
            {
                editable ? (
                    <div className="edit-salary">
                        <input
                            className="input-field"
                            type="text"
                            placeholder={distribution?.left?.value}
                            onChange={(e) => handleChange(e, "left")}
                        />
                        <input
                            className="input-field"
                            type="text"
                            placeholder={distribution?.middle?.value}
                            onChange={(e) => handleChange(e, "middle")}
                        />
                        <input
                            className="input-field"
                            type="text"
                            placeholder={distribution?.right?.value}
                            onChange={(e) => handleChange(e, "right")}
                        />
                    </div>
                ): null
            }
            <div className="bar-container">
                <div className="bar-left" style={{width: distribution?.left?.percent + "%"}}>
                    <React.Fragment>
                        {
                            !editable ? (
                                <span>{distribution?.left?.value}</span>
                            ) : null
                        }
                        <span>{formatPercent(10)}</span>
                        <div className="bar-line"/>
                    </React.Fragment>
                </div>
                <div className="bar-middle">
                    <React.Fragment>
                        {
                            !editable ? (
                                <span>{distribution?.middle?.value}</span>
                            ) : null
                        }
                        <span>{formatPercent(10)}</span>
                        <div className="bar-line"/>
                    </React.Fragment>
                </div>
                <div className="bar-right" style={{width: distribution?.right?.percent + "%"}}>
                    <React.Fragment>
                        {
                            !editable ? (
                                <span>{distribution?.right?.value}</span>
                            ) : null
                        }
                        <span>{formatPercent(10)}</span>
                        <div className="bar-line"/>
                    </React.Fragment>
                </div>
            </div>
        </React.Fragment>
    );
}