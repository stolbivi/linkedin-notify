import React from "react";
import "./NotesContainer.scss";

type Props = {
    children?: React.ReactNode
};

export const NotesContainer: React.FC<Props> = ({children}) => {

    return (
        <React.Fragment>
            <div className="notes-container">
                {children}
            </div>
        </React.Fragment>
    );
}