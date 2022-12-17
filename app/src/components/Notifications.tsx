import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, MESSAGE_ID, NotificationsResponse, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {NotificationCard} from "./NotificationCard";
import {Loader} from "./Loader";

type Props = {};

export const Notifications: React.FC<Props> = ({}) => {

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
            }).then(/* nada */)
    }, []);

    return (
        <div className="w-100">
            <Loader show={!completed}/>
            {completed && notifications.length == 0 && <div className="no-data">No data</div>}
            {notifications}
        </div>
    );
};