import React, {useEffect, useState} from "react";
import {
    AppMessageType,
    Badges,
    BadgesResponse,
    IAppRequest,
    MESSAGE_ID,
    NotificationsResponse,
    VERBOSE
} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {NotificationCard} from "./NotificationCard";
import {Loader} from "./Loader";

type Props = {
    setBadges: (badges: Badges) => void
};

export const Notifications: React.FC<Props> = ({setBadges}) => {

    const [notifications, setNotifications] = useState([]);
    const [completed, setCompleted] = useState(false);

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    useEffect(() => {
        messages.request<IAppRequest, NotificationsResponse>({type: AppMessageType.Notifications},
            (r) => {
                setNotifications(r.notifications.map((n: any, i: number) =>
                    (<NotificationCard notification={n} key={i}></NotificationCard>)
                ));
                setCompleted(true);
            }).then(/* nada */);
        messages.request<IAppRequest, any>({type: AppMessageType.MarkNotificationsSeen})
            .then(_ => messages.request<IAppRequest, BadgesResponse>({type: AppMessageType.Badges},
                (r) => setBadges(r.badges))
                .then(/* nada */));
    }, []);

    return (
        <div className="w-100">
            <Loader show={!completed} className="p-5"/>
            {completed && notifications.length == 0 && <div className="no-data">No notifications</div>}
            {notifications}
        </div>
    );
};