import React, {useEffect, useState} from "react";
import {Salary} from "../SalaryPill";

import "./PayDistribution.scss";

type Props = {
    salary: Salary
};

interface Sample {
    percent: number
    value: string
}

interface Distribution {
    left: Sample
    middle: Sample
    right: Sample
}

export const PayDistribution: React.FC<Props> = ({salary}) => {

    const [distribution, setDistribution] = useState<Distribution>();

    const formatPercent = (percent: number) => percent && (percent.toFixed(0) + "%");

    useEffect(() => {
        function formatValue(value: number) {
            return `${salary.symbol}${Number(value / 1000).toFixed(0)}K`;
        }

        setDistribution({
            left: {
                percent: 10,
                value: salary.payDistribution[0]
            },
            middle: {
                percent: 80,
                value: formatValue(salary.payDistributionValues[1] + salary.payDistributionValues[2] / 2)
            },
            right: {
                percent: 10,
                value: salary.payDistribution[3]
            }
        })
    }, []);

    return (
        <React.Fragment>
            <div className="bar-container">
                <div className="bar-left" style={{width: distribution?.left?.percent + "%"}}>
                    <span>{distribution?.left?.value}</span>
                    <span>{formatPercent(10)}</span>
                    <div className="bar-line"/>
                </div>
                <div className="bar-middle">
                    <span>{distribution?.middle?.value}</span>
                    <span>Median</span>
                    <div className="bar-line"/>
                </div>
                <div className="bar-right" style={{width: distribution?.right?.percent + "%"}}>
                    <span>{distribution?.right?.value}</span>
                    <span>{formatPercent(90)}</span>
                    <div className="bar-line"/>
                </div>
            </div>
        </React.Fragment>
    );
}