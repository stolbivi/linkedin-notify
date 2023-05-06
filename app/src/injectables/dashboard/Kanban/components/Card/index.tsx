import React, { useContext, useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ThemeContext } from 'styled-components';
import getCategoryBackgroundColor from '../../helpers/getCategoryBackgroundColor';
import ICard from '../../interfaces/ICard';
import Badge from '../Badge';
import { CardBorder, CardBottom, CardContainer } from './styles';
// @ts-ignore
import stylesheet from './styles.scss';
import {showNotesAndCharts} from "../../../../../actions";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../../../../../global";

interface CardProps {
  card: ICard;
  index: number;
}

const Card: React.FC<CardProps> = ({ card, index }) => {

  const theme = useContext(ThemeContext);
  const [backgroundColor, setBackgroundColor] = useState<string>(theme.colors.primary);
  const messages = new MessagesV2(VERBOSE);

  const onMoreClick =(event: React.MouseEvent<HTMLParagraphElement, MouseEvent>)=> {
    event.stopPropagation();
    messages.request(showNotesAndCharts({
      userId: card.userId,
      profileId: card.profileId,
      showSalary: false,
      showNotes: true,
      showStages: true
    }));
  }

  useEffect(() => {
    if (card) {
      const categoryColor = getCategoryBackgroundColor(theme, card.category);
      setBackgroundColor(categoryColor);
    }
  }, [card])

  return (
    <Draggable draggableId={card.id} index={index}>
      {provided => (
        <CardContainer
          className="card-container-external"
          onClick={()=>window.open(`https://www.linkedin.com/in/${card.userId}`, '_blank')}
          hideCard={card.hidden}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
          <CardBorder color={backgroundColor}/>
          <div className="card-container">
            <img src={card.profileImg} alt="img" width={40} height={40} style={{borderRadius:"100%"}} />
            <div>
              <h3 className="card-title">{card.name}</h3>
              <p className="job-detail">{card.designation}</p>
            </div>
          </div>
          <CardBottom>
            <Badge category={card.category}/>
            <p onClick={onMoreClick} className="more-text">+More</p>
          </CardBottom>
        </CardContainer>
      )}
    </Draggable>
  )
}

export default Card;
