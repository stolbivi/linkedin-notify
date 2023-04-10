import React, {useEffect, useState} from 'react';
import {DragDropContext, DropResult} from 'react-beautiful-dnd';
import ICard from '../../interfaces/ICard';
import IStatus from '../../interfaces/IStatus';
import IColumn from '../../interfaces/IColumn';
import ICategory from '../../interfaces/ICategory';
import Column from '../Column';
import Modal from '../Modal';
import {useModal} from '../../hooks/useModal';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {Container, Header, StatusesColumnsContainer} from './styles';
import {setColumns} from '../../store/slices/columns.slice';
import {filterCards, setCards} from '../../store/slices/cards.slice';
// @ts-ignore
import stylesheet from './styles.scss';

interface KanbanBoardProps {
  toggleTheme: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = () => {

  const { cards } = useAppSelector((state => state.cards));
  const { columns } = useAppSelector((state => state.columns));
  const { visible } = useModal();
  const [activeButton, setActiveButton] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>(Object.values(ICategory));

  const dispatch = useAppDispatch();
  
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
        destination.droppableId === source.droppableId && 
        destination.index === source.index
      ) return;

    const updatedCards: ICard[] = cards.map(card => {
      if (card.id === draggableId) {

        const status: IStatus = destination.droppableId as IStatus;

        return {
          ...card,
          status
        }
      } else return card;
    })

    const sourceColumn: IColumn = columns.find(column => column.id === source.droppableId) as IColumn;
    const destinationColumn: IColumn = columns.find(column => column.id === destination.droppableId) as IColumn;

    //Moving cards in the same column
    if (sourceColumn === destinationColumn) {

      const newColumnCardsIds = [...destinationColumn.cardsIds];

      newColumnCardsIds.splice(source.index, 1);
      newColumnCardsIds.splice(destination.index, 0, draggableId);
  
      const newDestinationColumn: IColumn = {
        ...destinationColumn,
        cardsIds: newColumnCardsIds
      }
  
      const updatedColumns: IColumn[] = columns.map(column => {
        if (column.id === newDestinationColumn.id) return newDestinationColumn;
        else return column;
      }) ;
  
      dispatch(setColumns(updatedColumns))
      dispatch(setCards(updatedCards))

      return
    }

    //Moving cards from one column to another
    const sourceCardsIds = [...sourceColumn.cardsIds];
    sourceCardsIds.splice(source.index, 1);

    const newSourceColumn: IColumn = {
      ...sourceColumn,
      cardsIds: sourceCardsIds
    }

    const destinationCardsIds = [...destinationColumn.cardsIds];
    destinationCardsIds.splice(destination.index, 0, draggableId);

    const newDestinationColumn: IColumn = {
      ...destinationColumn,
      cardsIds: destinationCardsIds
    }

    const updatedColumns: IColumn[] = columns.map(column => {
      if (column.id === newDestinationColumn.id) return newDestinationColumn;
      if (column.id === newSourceColumn.id) return newSourceColumn;
      else return column;
    }) ;

    dispatch(setColumns(updatedColumns))
    dispatch(setCards(updatedCards))

  }

  // const handleChangeCheckbox = (category: ICategory) => {
  //   const foundCategory = selectedCategories.find(item => item === category);
  //
  //   if (foundCategory){
  //     const categoriesWithItemRemoved = selectedCategories.filter(item => item !== category);
  //     setSelectedCategories(categoriesWithItemRemoved);
  //     return
  //   }
  //
  //   setSelectedCategories([...selectedCategories, category])
  // }

  useEffect(() => {
    dispatch(filterCards({categories: selectedCategories}))
  }, [selectedCategories])

  function handleClick(button) {
    setActiveButton(button);
  }

  return (
    <>
      <Container>
        <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
        <Header>
          <h1 className="kanban-title">Candidates</h1>
          <button className="share-button">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.8638 6.0957L8.2211 10.7384C8.15617 10.8034 8.07341 10.8477 7.9833 10.8657C7.89319 10.8836 7.79978 10.8744 7.7149 10.8392C7.63002 10.8041 7.55749 10.7445 7.50648 10.6681C7.45547 10.5917 7.42828 10.5018 7.42835 10.41V8.10195C4.11459 8.28998 1.84255 10.439 1.20476 11.1197C1.10461 11.2267 0.973274 11.2993 0.829449 11.3273C0.685624 11.3553 0.536635 11.3372 0.403684 11.2756C0.270733 11.214 0.160596 11.1121 0.0889451 10.9843C0.0172946 10.8565 -0.012218 10.7093 0.00460746 10.5638C0.219915 8.69158 1.24538 6.89077 2.89239 5.49331C4.26026 4.33262 5.92294 3.59617 7.42835 3.46733V1.12449C7.42828 1.03261 7.45547 0.942779 7.50648 0.866363C7.55749 0.789946 7.63002 0.730382 7.7149 0.695212C7.79978 0.660043 7.89319 0.650848 7.9833 0.668792C8.07341 0.686737 8.15617 0.731013 8.2211 0.796017L12.8638 5.43876C12.907 5.48187 12.9412 5.53308 12.9646 5.58944C12.988 5.6458 13 5.70622 13 5.76723C13 5.82824 12.988 5.88866 12.9646 5.94502C12.9412 6.00138 12.907 6.05259 12.8638 6.0957Z" fill="#585858"/>
            </svg>
            <span>Share</span>
          </button>
          <h3 className="shared-title">Shared with: </h3>
        </Header>
        <div className="button-container">
          <button
              className={`button ${activeButton === 'All' ? 'active' : ''}`}
              onClick={() => handleClick('All')}
          >
            All
          </button>
          <button
              className={`button ${activeButton === 'Availability' ? 'active' : ''}`}
              onClick={() => handleClick('Availability')}
          >
            Availability
          </button>
          <button
              className={`button ${activeButton === 'Status' ? 'active' : ''}`}
              onClick={() => handleClick('Status')}
          >
            Status
          </button>
          <button
              className={`button ${activeButton === 'Type' ? 'active' : ''}`}
              onClick={() => handleClick('Type')}
          >
            Type
          </button>
          <button
              className={`button ${activeButton === 'Geography' ? 'active' : ''}`}
              onClick={() => handleClick('Geography')}
          >
            Geography
          </button>
          <button
              className={`button ${activeButton === 'Groups' ? 'active' : ''}`}
              onClick={() => handleClick('Groups')}
          >
            Groups
          </button>
        </div>
        <StatusesColumnsContainer>
          <DragDropContext onDragEnd={onDragEnd}>
            {columns.map((column, index) => {

              const cardsArray: ICard[] = [];

              column.cardsIds.forEach(cardId => {
                const foundedCard = cards.find(card => card.id === cardId);
                if (foundedCard) cardsArray.push(foundedCard);
              })

              return (
                <Column
                  key={column.id}
                  index={index}
                  status={column.id}
                  cards={cardsArray}
                />
            )})}
          </DragDropContext>
        </StatusesColumnsContainer>
      </Container>
      <Modal visible={visible}/>
    </>
  )
}

export default KanbanBoard;