import React from "react";
import "./StageContainer.scss";
import {StageEnum, StageSwitch} from "./Stage";

type Props = {
    stage: StageEnum
    setStage: (s: StageEnum) => void
    id: string
};

export const StageContainer: React.FC<Props> = ({stage, setStage, id}) => {

    return (
        <React.Fragment>
            <div className="stage-container">
                <span>Pick a stage</span>
                <div className="stages">
                    <StageSwitch type={StageEnum.Interested} activeStage={stage} setStage={setStage} id={id}/>
                    <StageSwitch type={StageEnum.NotInterested} activeStage={stage} setStage={setStage} id={id}/>
                    <StageSwitch type={StageEnum.Interviewing} activeStage={stage} setStage={setStage} id={id}/>
                    <StageSwitch type={StageEnum.FailedInterview} activeStage={stage} setStage={setStage} id={id}/>
                    <StageSwitch type={StageEnum.Hired} activeStage={stage} setStage={setStage} id={id}/>
                </div>
            </div>
        </React.Fragment>
    );
}