import React from "react";
import {LOGIN_URL} from "../global";

type Props = {
    className?: string
};

export const SignUp: React.FC<Props> = ({className}) => {

    return (
        <React.Fragment>
            <a href={LOGIN_URL} className={className}>Start Your 7 Days PRO Trial Now</a>
        </React.Fragment>
    );
};