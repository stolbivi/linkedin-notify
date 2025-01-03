import React, {useState} from "react";
import "./Collapsible.scss";

type Props = {
    children?: React.ReactNode
    initialOpened?: boolean
    typeCollapse?: boolean
};

export enum CollapsibleRole {
    Title,
    Static,
    Collapsible,
    Footer
}

export const Collapsible: React.FC<Props> = ({children, initialOpened = true, typeCollapse}) => {

    const [opened, setOpened] = useState(initialOpened);

    const getTransition = () => opened ? "opened" : "closed";

    const onClick = () => setOpened(!opened);

    // @ts-ignore
    const getTile = () => [...children].filter(c => c.props["data-role"] === CollapsibleRole.Title);

    const getStatic = () => [...children].filter(c => c.props["data-role"] === CollapsibleRole.Static);

    const getCollapsible = () => [...children].filter(c => c.props["data-role"] === CollapsibleRole.Collapsible);

    const getFooter = () => [...children].filter(c => c.props["data-role"] === CollapsibleRole.Footer);

    return (
        <React.Fragment>
            <div className="collapsible-container">
                <div className="collapsible-title" onClick={onClick}>
                    {typeCollapse ? (
                        <svg className={getTransition()} width="8" height="10" viewBox="0 0 8 10" fill="none"
                             xmlns="http://www.w3.org/2000/svg" style={{marginBottom: '82px'}}>
                            <path
                                d="M7.30139 5.82404L2.06653 9.42301C1.40303 9.87917 0.5 9.40415 0.5 8.59897L0.5 1.40103C0.5 0.595851 1.40303 0.12083 2.06653 0.576988L7.30139 4.17596C7.87936 4.57331 7.87936 5.42669 7.30139 5.82404Z"
                                fill="#1569BF"/>
                        </svg>
                    ) : (
                        <svg className={getTransition()} width="8" height="10" viewBox="0 0 8 10" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M7.30139 5.82404L2.06653 9.42301C1.40303 9.87917 0.5 9.40415 0.5 8.59897L0.5 1.40103C0.5 0.595851 1.40303 0.12083 2.06653 0.576988L7.30139 4.17596C7.87936 4.57331 7.87936 5.42669 7.30139 5.82404Z"
                                fill="#1569BF"/>
                        </svg>
                    )
                    }
                    <span>{getTile()}</span>
                </div>
                {getStatic()}
                {opened && getCollapsible()}
                {getFooter()}
            </div>
        </React.Fragment>
    );
}