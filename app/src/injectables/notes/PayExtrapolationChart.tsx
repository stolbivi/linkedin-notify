import Chart from 'chart.js/auto';
import React, {useEffect, useRef, useState} from "react";
import {Salary} from "../../../src/store/SalaryReducer";
import "./PayExtrapolationChart.scss";
import {Theme} from "../../global";

type Props = {
    salary: Salary
    theme: Theme
};

interface Sample {
    x: number
    y: number
    radius: number
}

export const PayExtrapolationChart: React.FC<Props> = ({salary, theme}) => {

    const EXTRA_LENGTH = 20;
    const STEP = 5;

    const [data, setData] = useState<Sample[]>();
    const [chart, setChart] = useState<Chart>();

    function convertToValue(amount: string): number {
        const currencyMap: {[currency: string]: number} = {
            "$": 1,
            "£": 1.39,
            "€": 1.21,
        };

        if (!amount || typeof amount !== "string") {
            return;
        }

        const match = amount.match(/^([^\d]*)([\d,]+(\.\d+)?)([KM]?)$/);

        if (!match) {
            throw new Error("Invalid format: " + amount);
        }

        const currency = match[1] || "$";
        const value = match[2];
        const unit = match[4];

        if (!currencyMap[currency]) {
            throw new Error("Unknown currency: " + currency);
        }

        const number = parseFloat(value.replace(/,/g, ""));
        const currencyValue = currencyMap[currency];

        if (unit === "K") {
            return number * currencyValue * 1000;
        } else if (unit === "M") {
            return number * currencyValue * 1000000;
        } else {
            return number * currencyValue;
        }
    }

    const extractData = () => {
        if (salary && salary.formattedPayValue && salary.payDistributionValues) {
            const first = convertToValue(String(salary.formattedPayValue));
            const last = convertToValue(String(salary.payDistributionValues.slice().pop()));
            const step = (last - first) / EXTRA_LENGTH;
            let data: Sample[] = [];
            for (let i = 0; i <= EXTRA_LENGTH; i += STEP) {
                data.push({x: i, y: first + i * step, radius: 0});
            }
            const payValue = salary.progressivePayValue ?? salary.formattedPayValue;
            const payX = (payValue - first) / step;
            data.push({x: payX, y: payValue, radius: 5});
            data.sort((a, b) => a.x - b.x);
            setData(data);
        }
    }

    const canvasRef = useRef<HTMLCanvasElement>();

    useEffect(() => {
        if (canvasRef.current && data) {
            const ctx = canvasRef.current.getContext("2d");
            const gradient = ctx.createLinearGradient(0, 0, 400, 0);
            gradient.addColorStop(0, theme["--pay-chart-color1"]);
            gradient.addColorStop(1, theme["--pay-chart-color2"]);
            if (chart) {
                chart.destroy();
            }
            let newChart = new Chart(
                canvasRef.current,
                {
                    data: {
                        datasets: [
                            {
                                type: 'scatter',
                                data: data,
                                showLine: true,
                                fill: true,
                                borderColor: theme["--pay-chart-border"],
                                backgroundColor: gradient,
                                pointRadius: data.map(row => row.radius)
                            }
                        ]
                    },
                    options: {
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    title: () => "",
                                    label: () => salary.progressivePay
                                }
                            }
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                grid: {
                                    color: theme["--pay-chart-grid"]
                                },
                                ticks: {
                                    count: STEP,
                                    callback: ((value: number) => {
                                        if (value < STEP) {
                                            return "< 1 yr"
                                        } else if (value === STEP) {
                                            return "1-4 yrs"
                                        } else {
                                            return `${value - STEP}-${value - 1} yrs`
                                        }
                                    })
                                }
                            },
                            y: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    callback: (value: number) => `${(value / 1000).toFixed(0)}K`
                                }
                            }
                        }
                    }
                },
            );
            setChart(newChart);
        }
    }, [data, theme]);

    useEffect(() => {
        extractData();
    }, [salary]);

    return (
        <React.Fragment>
            <div className="pay-ex-chart">
                <canvas id="chart-canvas" ref={canvasRef}></canvas>
            </div>
        </React.Fragment>
    );
}