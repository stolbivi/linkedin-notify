import React from "react";
import "./StageSwitch.scss";
import {StageEnum, StageLabels} from "./StageSwitch";

type Props = {
    type: StageEnum
    selected: boolean
    onSelect: (type: StageEnum, selected: boolean) => void
    notesDropDown?: boolean
};

export const StageButton: React.FC<Props> = ({type, selected, onSelect, notesDropDown}) => {

    const onClick = (e: any) => {
        onSelect(type, !selected);
        e.stopPropagation();
    }

    return (
        <React.Fragment>
            <div className={"stage " + (selected ? StageLabels[type].class : "inactive") + (notesDropDown ? " note-drop-down" : "")} onClick={onClick}>
                <label>{StageLabels[type].label}</label>
            </div>
        </React.Fragment>
    );
}