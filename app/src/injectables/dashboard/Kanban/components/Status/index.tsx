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
            <div className="align-items-center" style={
            showTooltip ? {display: 'grid', gridTemplateColumns: remainingStatuses.length + 2 >= 4 ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gridGap: '3px'} : {display: 'flex'}
            }
            >
                {firstTwoStatuses.map((category: ICategory) => (
                    <Badge category={category} key={category + Math.random()} />
                ))}
                          {remainingStatuses.length > 0 && !showTooltip && (
                        <span onClick={handleRemainingClick} ref={badgeRef} className="badge text-primary rounded-pill pt-2 pl-4 pr-4 pb-2"
                            style={{backgroundColor: "#e6e6e6", cursor: "pointer"}}>
                            +{remainingStatuses.length}
                        </span>
            )}
                {
                    remainingStatuses.length > 0 && showTooltip && (
                        <>
                            {remainingStatuses.map((category: ICategory) => (
                                <span ref={tooltipRef}>
                                <Badge  category={category} key={category + Math.random()} />
                                </span>
                            ))}
                        </>
                    )
                }
   
            </div>
  
        </>
    );
}

export default Status;
