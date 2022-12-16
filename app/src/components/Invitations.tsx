import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, InvitationsResponse, MESSAGE_ID} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {InvitationCard} from "./InvitationCard";
import {Loader} from "./Loader";

type Props = {};

export const Invitations: React.FC<Props> = ({}) => {

    const [invitations, setInvitations] = useState([]);
    const [completed, setCompleted] = useState(false);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, InvitationsResponse>(MESSAGE_ID, {type: AppMessageType.Invitations},
            (r) => {
                setInvitations(r.invitations.map((v: any, i: number) =>
                    (<InvitationCard invitation={v} key={i}></InvitationCard>)
                ));
                setCompleted(true);
            }).then(/* nada */)
    }, []);

    return (
        <div className="w-100">
            <Loader show={!completed}/>
            {completed && invitations.length == 0 && <div className="no-data">No data</div>}
            {invitations}
        </div>
    );
};