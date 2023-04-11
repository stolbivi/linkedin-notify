import React, { useContext, useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ThemeContext } from 'styled-components';
import getCategoryBackgroundColor from '../../helpers/getCategoryBackgroundColor';
import { useModal } from '../../hooks/useModal';
import ICard from '../../interfaces/ICard';
import Badge from '../Badge';
import icon from '../Card/image.png';
import { CardBorder, CardBottom, CardContainer } from './styles';
// @ts-ignore
import stylesheet from './styles.scss';

interface CardProps {
  card: ICard;
  index: number;
}

const Card: React.FC<CardProps> = ({ card, index }) => {
  const theme = useContext(ThemeContext); 

  const [backgroundColor, setBackgroundColor] = useState<string>(theme.colors.primary);

  const { toggleVisibility } = useModal();

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
          onClick={() => toggleVisibility(card)} 
          hideCard={card.hidden}
          ref={provided.innerRef} 
          {...provided.draggableProps} 
          {...provided.dragHandleProps}
        >
          <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
          <CardBorder color={backgroundColor}/>
          <div className="card-container">
            <img src={icon} alt="img" />
            <div>
              <h3 className="card-title">Jerome Bell</h3>
              {/*<h3 className="card-title">{card.title}</h3>*/}
              <p className="job-detail">UI/UX Designer</p>
            </div>
          </div>
          <CardBottom>
            <Badge category={card.category}/>
            <p className="more-text">+More</p>
          </CardBottom>
        </CardContainer>
      )}
    </Draggable>
  )
}

export default Card;