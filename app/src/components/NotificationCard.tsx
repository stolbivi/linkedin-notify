import React, {useEffect, useState} from "react";

type Props = {
    notification: any
};


export const NotificationCard: React.FC<Props> = ({notification}) => {

    const [picture, setPicture] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [cardAction, setCardAction] = useState("");
    const [actions, setActions] = useState([]);

    const isToday = (someDate: Date) => {
        const today = new Date()
        return someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear()
    }

    const onAction = (actionTarget: string) => {
        console.log("actionTarget:", actionTarget);
    }

    const onCardAction = () => {
        console.log("cardAction:", cardAction);
    }

    useEffect(() => {
        if (notification.headerImage?.rootUrl) {
            setPicture(notification.headerImage?.rootUrl + notification.headerImage?.artifacts?.pop()?.path);
        }
        if (notification.headerImage?.url) {
            setPicture(notification.headerImage?.url);
        }
        setPublishedAt(notification.publishedAt);
        console.log(JSON.stringify(notification));
        const timestamp = new Date(notification.publishedAt);
        setPublishedAt(isToday(timestamp) ? timestamp.toLocaleTimeString() : timestamp.toLocaleDateString());
        setCardAction(notification.cardAction);
        setActions(notification.actions.map((a: any) =>
            (<div className="notification-action" onClick={() => onAction(a.onAction)}>{a.displayText}</div>)
        ));
    }, []);

    return (
        <div className={"notification-card" + (notification.read === false ? " has-unread" : "")}
             onClick={onCardAction}>
            {picture.length > 0 && <div className="card-image">
                <img src={picture}/>
            </div>}
            <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                <div className="w-100 d-flex flex-row">
                    <div className="card-timestamp">{publishedAt}</div>
                </div>
                <div className="w-100 d-flex flex-row">
                    <div className="card-message">{notification.headline}</div>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between align-items-center pt-1">
                    {actions}
                </div>
            </div>
        </div>
    );
};