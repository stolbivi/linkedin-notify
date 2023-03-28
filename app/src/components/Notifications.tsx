import React, {useEffect, useState} from "react";
import {Badges, VERBOSE} from "../global";
import {MessagesV2} from "@stolbivi/pirojok";
import {NotificationCard} from "./NotificationCard";
import {Loader} from "./Loader";
import "./NoData.scss";
import {getBadges, getNotifications, markNotificationsSeen} from "../actions";

type Props = {
    setBadges: (badges: Badges) => void
};

export const Notifications: React.FC<Props> = ({setBadges}) => {

    const [notifications, setNotifications] = useState([]);
    const [completed, setCompleted] = useState(false);

    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        messages.request(getNotifications())
            .then((notifications) => {
                setNotifications(notifications.map((n: any, i: number) =>
                    (<NotificationCard notification={n} key={i}></NotificationCard>)
                ));
                setCompleted(true);
            });
        messages.request(markNotificationsSeen())
            .then(_ => messages.request(getBadges())
                .then((badges) => setBadges(badges)));
    }, []);

    return (
        <div className="w-100">
            <Loader show={!completed} className="p-5" heightValue="600px"/>
            {completed && notifications.length == 0 && <div className="no-data">No notifications</div>}
            {notifications}
        </div>
    );
};