import React, {useEffect, useState} from "react";

type Props = {
    invitation: any
};


export const InvitationCard: React.FC<Props> = ({invitation}) => {

    const [picture, setPicture] = useState("");
    const [sentTime, setSentTime] = useState("");

    const isToday = (someDate: Date) => {
        const today = new Date()
        return someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear()
    }

    useEffect(() => {
        if (invitation?.fromMember?.picture?.rootUrl) {
            setPicture(invitation?.fromMember?.picture?.rootUrl + invitation?.fromMember?.picture?.artifacts?.pop()?.path);
        } else {
            setPicture("https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q");
        }
        const timestamp = new Date(invitation.sentTime);
        setSentTime(isToday(timestamp) ? timestamp.toLocaleTimeString() : timestamp.toLocaleDateString());
    }, []);

    const onIgnore = () => {
        console.log("onIgnore");
    }

    const onAccept = () => {
        console.log("onAccept");
    }

    const onReply = () => {
        console.log("onReply");
    }

    const onOpenProfile = () => {
        console.log("onOpenProfile");
    }

    return (
        <div className={"invitation-card" + (invitation.unseen === true ? " has-unread" : "")}>
            <div className="card-image">
                <img src={picture}/>
            </div>
            <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                <div className="w-100 d-flex flex-row">
                    <div
                        className="card-title"
                        onClick={onOpenProfile}>{invitation.fromMember?.firstName} {invitation.fromMember?.lastName}</div>
                    <div className="card-timestamp">{sentTime}</div>
                </div>
                <div className="w-100 d-flex flex-row align-items-center">
                    <div className="card-subtitle" onClick={onOpenProfile}>{invitation.fromMember?.occupation}</div>
                    <div className="action-ignore" onClick={onIgnore}>Ignore</div>
                    <div className="action-accept" onClick={onAccept}>Accept</div>
                </div>
                {invitation.customMessage &&
                <div className="custom-message">
                    <div>{invitation.message}</div>
                    <div className="action-reply" onClick={onReply}>Reply to {invitation.fromMember?.firstName}</div>
                </div>}
            </div>
        </div>
    );
};