import React from "react";
import "./StageSwitch.scss";
import {StageEnum, StageLabels} from "./StageSwitch";

type Props = {
    type: StageEnum
    selected: boolean
    onSelect: (type: StageEnum, selected: boolean) => void
};

export const StageButton: React.FC<Props> = ({type, selected, onSelect}) => {

    const onClick = (e: any) => {
        onSelect(type, !selected);
        e.stopPropagation();
    }

    return (
        <React.Fragment>
            <div className={"stage " + (selected ? StageLabels[type].class : "inactive")} onClick={onClick}>
                <label>{StageLabels[type].label}</label>
            </div>
        </React.Fragment>
    );
}