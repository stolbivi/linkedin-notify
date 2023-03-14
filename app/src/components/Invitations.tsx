import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, InvitationsResponse, MESSAGE_ID, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {InvitationCard} from "./InvitationCard";
import {Loader} from "./Loader";

type Props = {};

export const Invitations: React.FC<Props> = ({}) => {

    const [invitations, setInvitations] = useState([]);
    const [completed, setCompleted] = useState(false);

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    useEffect(() => {
        messages.request<IAppRequest, InvitationsResponse>({type: AppMessageType.Invitations},
            (r) => {
                setInvitations(r.invitations.map((v: any, i: number) =>
                    (<InvitationCard invitation={v} key={i}></InvitationCard>)
                ));
                setCompleted(true);
            }).then(/* nada */)
    }, []);

    return (
        <div className="w-100">
            <Loader show={!completed} className="p-5"/>
            {completed && invitations.length == 0 && <div className="no-data">No new network invitations</div>}
            {invitations}
        </div>
    );
};