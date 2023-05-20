import React, { useContext, useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ThemeContext } from 'styled-components';
import getCategoryBackgroundColor from '../../helpers/getCategoryBackgroundColor';
import ICard from '../../interfaces/ICard';
import Badge from '../Badge';
import { CardBorder, CardBottom, CardContainer } from './styles';
// @ts-ignore
import stylesheet from './styles.scss';
import {localStore} from "../../../../../../src/store/LocalStore";
import {showNotesAndChartsAction} from "../../../../../../src/store/ShowNotesAndCharts";
import { useAppDispatch } from '../../hooks/useRedux';
import { setActiveCard } from '../../../../../store/cards.slice';

interface CardProps {
  card: ICard;
  index: number;
  draggableId?: string;
}

const Card: React.FC<CardProps> = ({ card, index, draggableId }) => {

  const dispatch = useAppDispatch();
  const theme = useContext(ThemeContext);
  const [backgroundColor, setBackgroundColor] = useState<string>(theme.colors.primary);
  const onMoreClick =(event: React.MouseEvent<HTMLParagraphElement, MouseEvent>)=> {
    event.stopPropagation();
    window.parent.scrollTo(0, 0);
    dispatch(setActiveCard(card))
    localStore.dispatch(showNotesAndChartsAction({id: card.userId, state: {showSalary: false, showNotes: true, show: true, id: card.userId}, }));
  }

  useEffect(() => {
    if (card) {
      const categoryColor = getCategoryBackgroundColor(theme, card.category);
      setBackgroundColor(categoryColor);
    }
  }, [card])
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided) => (
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
