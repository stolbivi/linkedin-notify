import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, MESSAGE_ID, NotificationsResponse} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {NotificationCard} from "./NotificationCard";
import {Loader} from "./Loader";

type Props = {};

export const Notifications: React.FC<Props> = ({}) => {

    const [notifications, setNotifications] = useState([]);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, NotificationsResponse>(MESSAGE_ID, {type: AppMessageType.Notifications},
            (r) => {
                setNotifications(r.notifications.map((n: any, i: number) =>
                    (<NotificationCard notification={n} key={i}></NotificationCard>)
                ));
            }).then(/* nada */)
    }, []);

    return (
        <div className="w-100">
            <Loader show={!(notifications?.length > 0)}/>
            {notifications}
        </div>
    );
};