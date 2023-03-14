import React, {useState} from "react";
import {Badges} from "../global";
import {Users} from "../icons/Users";
import {Message} from "../icons/Message";
import {Notification} from "../icons/Notification";
import "./Tabs.scss";

type Props = {
    onTab: (tab: number) => void
    badges: Badges
};

export enum TabTypes {
    MyNetwork,
    Messages,
    Notifications
}

export const Tabs: React.FC<Props> = ({onTab, badges}) => {

    const [selected, setSelected] = useState(TabTypes.MyNetwork);

    const selectTab = (tab: TabTypes) => {
        setSelected(tab);
        onTab(tab);
    }

    const isSelected = (tab: TabTypes) => selected === tab;

    return (
        <div className="tabs">
            <div className={"tab-item" + (isSelected(TabTypes.MyNetwork) ? " tab-selected" : "")}
                 onClick={() => selectTab(TabTypes.MyNetwork)}>
                <Users/>
                <span>My Network</span>
                {badges.MY_NETWORK > 0 && <div className="tab-badge">{badges.MY_NETWORK}</div>}
            </div>
            <div className={"tab-item" + (isSelected(TabTypes.Messages) ? " tab-selected" : "")}
                 onClick={() => selectTab(TabTypes.Messages)}>
                <Message/>
                <span>Messaging</span>
                {badges.MESSAGING > 0 && <div className="tab-badge">{badges.MESSAGING}</div>}
            </div>
            <div className={"tab-item" + (isSelected(TabTypes.Notifications) ? " tab-selected" : "")}
                 onClick={() => selectTab(TabTypes.Notifications)}>
                <Notification/>
                <span>Notifications</span>
                {badges.NOTIFICATIONS > 0 && <div className="tab-badge">{badges.NOTIFICATIONS}</div>}
            </div>
        </div>
    );
};