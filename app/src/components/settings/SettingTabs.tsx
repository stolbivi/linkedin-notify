import React, {useState} from "react";
import {Users} from "../../icons/Users";
import {Message} from "../../icons/Message";
import "../Tabs.scss";

type Props = {
    onTab: (tab: number) => void
};

export enum SettingTabTypes {
    ProFeatures,
    AutoFeatures
}

export const SettingTabs: React.FC<Props> = ({onTab}) => {

    const [selected, setSelected] = useState(SettingTabTypes.ProFeatures);

    const selectTab = (tab: SettingTabTypes) => {
        setSelected(tab);
        onTab(tab);
    }

    const isSelected = (tab: SettingTabTypes) => selected === tab;

    return (
        <div className="tabs">
            <div className={"tab-item" + (isSelected(SettingTabTypes.ProFeatures) ? " tab-selected" : "")}
                 onClick={() => selectTab(SettingTabTypes.ProFeatures)}>
                <Users/>
                <span>Pro Features</span>
            </div>
            <div className={"tab-item" + (isSelected(SettingTabTypes.AutoFeatures) ? " tab-selected" : "")}
                 onClick={() => selectTab(SettingTabTypes.AutoFeatures)}>
                <Message/>
                <span>Auto Features</span>
            </div>
        </div>
    );
};