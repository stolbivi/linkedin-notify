import React, {useState} from "react";
import {Badges} from "../global";

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
                {badges.MY_NETWORK > 0 && <div className="tab-badge">{badges.MY_NETWORK}</div>}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                     className="mercado-match" width="24" height="24" focusable="false">
                    <path
                        d="M12 16v6H3v-6a3 3 0 013-3h3a3 3 0 013 3zm5.5-3A3.5 3.5 0 1014 9.5a3.5 3.5 0 003.5 3.5zm1 2h-2a2.5 2.5 0 00-2.5 2.5V22h7v-4.5a2.5 2.5 0 00-2.5-2.5zM7.5 2A4.5 4.5 0 1012 6.5 4.49 4.49 0 007.5 2z"></path>
                </svg>
                My Network
            </div>
            <div className={"tab-item" + (isSelected(TabTypes.Messages) ? " tab-selected" : "")}
                 onClick={() => selectTab(TabTypes.Messages)}>
                {badges.MESSAGING > 0 && <div className="tab-badge">{badges.MESSAGING}</div>}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"
                     focusable="false">
                    <path
                        d="M16 4H8a7 7 0 000 14h4v4l8.16-5.39A6.78 6.78 0 0023 11a7 7 0 00-7-7zm-8 8.25A1.25 1.25 0 119.25 11 1.25 1.25 0 018 12.25zm4 0A1.25 1.25 0 1113.25 11 1.25 1.25 0 0112 12.25zm4 0A1.25 1.25 0 1117.25 11 1.25 1.25 0 0116 12.25z"></path>
                </svg>
                Messaging
            </div>
            <div className={"tab-item" + (isSelected(TabTypes.Notifications) ? " tab-selected" : "")}
                 onClick={() => selectTab(TabTypes.Notifications)}>
                {badges.NOTIFICATIONS > 0 && <div className="tab-badge">{badges.NOTIFICATIONS}</div>}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                     className="mercado-match" width="24" height="24" focusable="false">
                    <path
                        d="M22 19.24a3.46 3.46 0 01-.09.78l-.22 1-6.76-1.51A2.16 2.16 0 0115 20a2 2 0 11-3.53-1.28L2 16.62l.22-1A4.45 4.45 0 014 13.12l1.22-.93 15.46 3.44.7 1.36a5 5 0 01.62 2.25zm-1.49-10.4a6.29 6.29 0 00-4.92-6.69A6.76 6.76 0 0014.18 2a6.29 6.29 0 00-5.9 4.12l-2 5.27 13.8 3.08z"></path>
                </svg>
                Notifications
            </div>
        </div>
    );
};