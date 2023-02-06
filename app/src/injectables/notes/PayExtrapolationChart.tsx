import Chart from 'chart.js/auto';
import React, {useEffect, useRef, useState} from "react";

import "./PayExtrapolationChart.scss";
import {Salary} from "../SalaryPill";

type Props = {
    salary: Salary
};

interface Sample {
    x: number
    y: number
    radius: number
}

export const PayExtrapolationChart: React.FC<Props> = ({salary}) => {

    const EXTRA_LENGTH = 20;
    const STEP = 5;

    const [data, setData] = useState<Sample[]>();

    const extractData = () => {
        const first = salary.formattedPayValue;
        const last = salary.payDistributionValues.slice().pop();
        const step = (last - first) / EXTRA_LENGTH;
        let data: Sample[] = [];
        for (let i = 0; i <= EXTRA_LENGTH; i += STEP) {
            data.push({x: i, y: first + i * step, radius: 0});
        }
        const payX = (salary.progressivePayValue - first) / step;
        data.push({x: payX, y: salary.progressivePayValue, radius: 5});
        data.sort((a, b) => a.x - b.x);
        setData(data);
    }

    const canvasRef = useRef<HTMLCanvasElement>();

    useEffect(() => {
        if (canvasRef.current && data) {
            const ctx = canvasRef.current.getContext("2d");
            const gradient = ctx.createLinearGradient(0, 0, 400, 0);
            gradient.addColorStop(0, '#F3F2EF');
            gradient.addColorStop(1, '#F4EDD8');

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
                                borderColor: '#A8A8A8',
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
                                        } else {
                                            return `${value - STEP + 1} - ${value} yrs`
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
    }, []);

    return (
        <React.Fragment>
            <div className="pay-ex-chart">
                <canvas id="chart-canvas" ref={canvasRef}></canvas>
            </div>
        </React.Fragment>
    );
}