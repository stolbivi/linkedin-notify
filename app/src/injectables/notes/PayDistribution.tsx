import React, {useEffect, useState} from "react";
import {Salary} from "../../store/SalaryReducer";

import "./PayDistribution.scss";

type Props = {
    salary: Salary;
    editable: boolean;
    currencySymbol: String;
    salaryLabel?: string;
    setSalaryInternal?: any
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

export const PayDistribution: React.FC<Props> = ({ salary,salaryLabel, setSalaryInternal , currencySymbol,editable}) => {
    const [distribution, setDistribution] = useState<Distribution>({
        left: {percent: 10, value: ""},
        middle: {percent: 80, value: ""},
        right: {percent: 10, value: ""},
    });

    useEffect(() => {

        function formatValue(value: number) {
            return !isNaN(value) ? `${salary?.symbol}${Number(value / 1000).toFixed(0)}K` : '$39K';
        }

        if (salary?.payDistribution && salary?.payDistributionValues) {
            setDistribution({
                left: {
                    percent: 10,
                    value: salary?.payDistribution[0],
                },
                middle: {
                    percent: 80,
                    value: formatValue(
                        (salary?.payDistributionValues[0] +
                              salary?.payDistributionValues[3]) / 2
                    ),
                },
                right: {
                    percent: 10,
                    value: salary?.payDistribution[3],
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

    useEffect(() => {
        const clonedSalary = JSON.parse(JSON.stringify(salary));
        if(editable && Object.keys(clonedSalary).length > 0 && clonedSalary?.payDistributionValues?.length > 0) {
            if(distribution.left.value !== "" && distribution.left.value !== "$" && typeof distribution.left.value === "string") {
                clonedSalary.payDistributionValues[0] = distribution.left.value?.replace("$", "");
            }
            if(distribution.right.value !== "" && distribution.right.value !== "$"  && typeof distribution.right.value === "string") {
                clonedSalary.payDistributionValues[clonedSalary.payDistributionValues.length - 1] = distribution.right.value?.replace("$", "");
            }
            clonedSalary.progressivePay = salaryLabel;
            clonedSalary.formattedPayValue = parseInt(salaryLabel?.replace("$", "").replace(",", ""));
            clonedSalary.progressivePayValue =  parseInt(salaryLabel?.replace("$", "").replace(",", ""));
            setSalaryInternal(clonedSalary);
        }
    },[salaryLabel,distribution]);

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
                        <span>10%</span>
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
                        <span>median</span>
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
                        <span>90%</span>
                        <div className="bar-line"/>
                    </React.Fragment>
                </div>

            </div>
        </React.Fragment>
    );
}
