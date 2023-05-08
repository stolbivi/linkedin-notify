import React, {useEffect, useRef, useState} from 'react';
import ICard from "../../interfaces/ICard";
import ICategory from '../../interfaces/ICategory';
import Badge from "../Badge";

interface BadgeProps {
    card: ICard
}

const Status: React.FC<BadgeProps> = ({card}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef(null);
    const badgeRef = useRef(null);

    const handleRemainingClick = () => {
        setShowTooltip((prev) => !prev);
    };

    const firstTwoStatuses: any = card?.statuses?.slice(0, 2) || [];
    const remainingStatuses: any = card?.statuses?.slice(2) || [];

    useEffect(() => {
        const handleClickOutside = (event: { target: any; }) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setShowTooltip(false);
            }
        };
        window.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="d-flex align-items-center">
                {firstTwoStatuses.map((category: ICategory, index: any) => (
                    <Badge category={category} key={category + index} />
                ))}
            </div>
            {remainingStatuses.length > 0 && (
                <div className="d-flex align-items-center position-relative" onClick={handleRemainingClick}>
                <span ref={badgeRef} className="badge text-primary rounded-pill pt-2 pl-4 pr-4 pb-2"
                      style={{backgroundColor: "#e6e6e6", cursor: "pointer"}}>
                    +{remainingStatuses.length}
                </span>
                    {showTooltip && (
                        <div className="position-fixed" ref={tooltipRef} style={{ top: '1px', left: '891px', transform: 'translateX(-50%)', zIndex: 9999}}>
                            <div className="bg-white text-white py-2 px-3 rounded d-flex align-items-center" style={{width: "max-content", fontWeight:"300"}}>
                                {remainingStatuses.map((category: ICategory, index: any) => (
                                    <Badge category={category} key={category + index} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default Status;
