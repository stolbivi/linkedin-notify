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
        function getPercent(i: number, j: number, total: number) {
            return (salary.payDistributionValues[j] - salary.payDistributionValues[i]) / total * 100;
        }

        function formatValue(value: number) {
            return `${salary.symbol}${Number(value / 1000).toFixed(0)}K`;
        }

        const total = salary.payDistributionValues[3] - salary.payDistributionValues[0];
        setDistribution({
            left: {
                percent: getPercent(0, 1, total),
                value: salary.payDistribution[0]
            },
            middle: {
                percent: getPercent(1, 2, total),
                value: formatValue(salary.payDistributionValues[1] + salary.payDistributionValues[2] / 2)
            },
            right: {
                percent: getPercent(2, 3, total),
                value: salary.payDistribution[3]
            }
        })
    }, []);

    return (
        <React.Fragment>
            <div className="bar-container">
                <div className="bar-left" style={{width: distribution?.left?.percent + "%"}}>
                    <span>{distribution?.left?.value}</span>
                    <span>{formatPercent(distribution?.left?.percent)}</span>
                    <div className="bar-line"/>
                </div>
                <div className="bar-middle">
                    <span>{distribution?.middle?.value}</span>
                    <span>Median</span>
                    <div className="bar-line"/>
                </div>
                <div className="bar-right" style={{width: distribution?.right?.percent + "%"}}>
                    <span>{distribution?.right?.value}</span>
                    <span>{formatPercent(distribution?.right?.percent)}</span>
                    <div className="bar-line"/>
                </div>
            </div>
        </React.Fragment>
    );
}