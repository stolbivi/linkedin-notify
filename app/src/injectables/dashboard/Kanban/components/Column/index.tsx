import React, {useEffect} from 'react';
import { Droppable } from 'react-beautiful-dnd';
import ICard from '../../interfaces/ICard';
import IStatus from '../../interfaces/IStatus';
import Card from '../Card';
import { CardsList, Container } from './styles';
// @ts-ignore
import stylesheet from "../Column/styles.scss";

interface ColumnProps {
  status: IStatus;
  cards: ICard[];
  index: number;
}

const Column: React.FC<ColumnProps> = ({ status, cards, index }) => {

    useEffect(()=>{
        console.log("Cards: ", cards);
        console.log("status: ", status);
    },[]);

  return (
    <Container isFirstColumn={index === 0}>
      <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
      <h2 className="status-title">{status}</h2>
      <Droppable droppableId={status}>
        {(provided) => (
          <CardsList ref={provided.innerRef} {...provided.droppableProps}>
            {cards
              .filter(card => card.status === status)
              .map((card, index) => <Card key={card.id} card={card} index={index}/>)
            }
            {provided.placeholder}
        </CardsList>
        )}
        </Droppable>
    </Container>
  )
}

export default Column;