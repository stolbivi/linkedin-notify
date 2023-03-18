import Chart from 'chart.js/auto';
import React, {useEffect, useRef, useState} from "react";
import {Salary} from "../SalaryPill";
import "./PayExtrapolationChart.scss";

type Props = {
    salary: Salary
};

interface Sample {
    x: number
    y: number
    radius: number
}

const colors = {
    light: {
        color1: "#F3F2EF",
        color2: "#F4EDD8",
        border: "#A8A8A8"
    }
}

export const PayExtrapolationChart: React.FC<Props> = ({salary}) => {

    const EXTRA_LENGTH = 20;
    const STEP = 5;

    const [data, setData] = useState<Sample[]>();

    const extractData = () => {
        if (salary) {
            const first = salary.formattedPayValue;
            const last = salary.payDistributionValues.slice().pop();
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
            gradient.addColorStop(0, colors.light.color1);
            gradient.addColorStop(1, colors.light.color2);


            new Chart(
                canvasRef.current,
                {
                    data: {
                        datasets: [
                            {
                                type: 'scatter',
                                data: data,
                                showLine: true,
                                fill: true,
                                borderColor: colors.light.border,
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
                                ticks: {
                                    callback: (value: number) => `${(value / 1000).toFixed(0)}K`
                                }
                            }
                        }
                    }
                },
            );
        }
    }, [data]);

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