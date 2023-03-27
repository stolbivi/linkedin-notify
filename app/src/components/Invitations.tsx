import React, {useEffect, useState} from "react";
import {VERBOSE} from "../global";
import {MessagesV2} from "@stolbivi/pirojok";
import {InvitationCard} from "./InvitationCard";
import {Loader} from "./Loader";
import "./NoData.scss";
import {getInvitations} from "../actions";

type Props = {};

export const Invitations: React.FC<Props> = ({}) => {

    const [invitations, setInvitations] = useState([]);
    const [completed, setCompleted] = useState(false);

    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        messages.request(getInvitations())
            .then((invitations) => {
                setInvitations(invitations.map((v: any, i: number) =>
                    (<InvitationCard invitation={v} key={i}></InvitationCard>)
                ));
                setCompleted(true);
            })
    }, []);

    return (
        <div className="w-100">
            <Loader show={!completed} className="p-5" heightValue="30rem"/>
            {completed && invitations.length == 0 && <div className="no-data">No new network invitations</div>}
            {invitations}
        </div>
    );
};