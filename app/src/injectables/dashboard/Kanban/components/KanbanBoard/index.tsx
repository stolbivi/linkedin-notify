/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, {useEffect, useState, useContext} from 'react';
import {ThemeContext} from "styled-components";
import {DragDropContext, DropResult} from 'react-beautiful-dnd';
import ICard from '../../interfaces/ICard';
import IStatus from '../../interfaces/IStatus';
import IColumn from '../../interfaces/IColumn';
import ICategory from '../../interfaces/ICategory';
import Column from '../Column';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {Container, Header, StatusesColumnsContainer} from './styles';
import {setColumns} from '../../../../../store/columns.slice';
import {filterCards, setCards} from '../../../../../store/cards.slice';
// @ts-ignore
import stylesheet from './styles.scss';
import {MessagesV2} from "@stolbivi/pirojok";
import {NoteExtended, VERBOSE} from "../../../../../global";
import {
  getAuthorStages,
  getCustomStages,
  setStage,
} from "../../../../../actions";
import {Loader} from "../../../../../components/Loader";
import ListView from "../ListView";
import {CompleteEnabled, DataWrapper, selectNotesAll} from "../../../../../store/LocalStore";
import {shallowEqual, useSelector} from "react-redux";
const KanbanBoard: React.FC<any> = () => {
  const { cards } = useAppSelector((state => state.cards));
  const { columns } = useAppSelector((state => state.columns));
  const [activeButton, setActiveButton] = useState(IStatus.AVAILABILITY);
  const [selectedCategories] = useState<ICategory[]>(Object.values(ICategory));
  const messages = new MessagesV2(VERBOSE);
  const dispatch = useAppDispatch();
  const [completed, setCompleted] = useState(false);
  const [kanbanData, setKanbanData] = useState({});
  const [listView, setListView] = useState(false);
  const theme = useContext(ThemeContext);
  const notesAll: CompleteEnabled<DataWrapper<NoteExtended[]>> = useSelector(selectNotesAll, shallowEqual);

  useEffect(() => {
    console.log("re-rending notesAll: ",notesAll)
    messages.request(getAuthorStages())
        .then((resp) => {
          if (resp.data) {
            setKanbanData(resp.data);
            setCompleted(true);
          }
        });
    if(sessionStorage.getItem("isListView")) {
      setListView(JSON.parse(sessionStorage.getItem("isListView")));
    }
  },[notesAll]);

  useEffect(() => {
    messages.request(getCustomStages())
        .then((customStages) => {
          if(customStages.length > 0) {
            customStages.map(stage => {
              // @ts-ignore
              if(!ICategory[stage.text]) {
                // @ts-ignore
                ICategory[stage.text] = stage.text;
              }
            });
          }
        })
        .catch(e => console.error(e.error));
    populateKanbanData(IStatus.AVAILABILITY);
  },[kanbanData])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if(activeButton === IStatus.ALL) return;
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
          category: destination.droppableId,
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
    });
    const selectedCard = cards.find(card => card.id === draggableId);
    dispatch(setColumns(updatedColumns))
    dispatch(setCards(updatedCards))
    if(activeButton === IStatus.GROUPS) {
      messages.request(setStage({id: selectedCard.profileId, stage: Object.values(ICategory).indexOf(destination.droppableId),
        stageFrom: Object.values(ICategory).indexOf(source.droppableId), stageText: destination.droppableId || undefined,
        parentStage: Object.values(IStatus).indexOf(activeButton)}))
          .then((_r) => {console.log(_r)});
    } else {
      messages.request(setStage({id: selectedCard.profileId, stage: Object.values(ICategory).indexOf(destination.droppableId),
        stageFrom: Object.values(ICategory).indexOf(source.droppableId), parentStage: Object.values(IStatus).indexOf(activeButton)}))
          .then((_r) => {console.log(_r)});
    }
  }

  useEffect(() => {
    dispatch(filterCards({categories: selectedCategories}))
  }, [selectedCategories]);

  function handleClick(button: string) {
    if (button !== activeButton) {
      populateKanbanData(button);
      setActiveButton(button);
    }
  }

  const populateKanbanData = (parentCategory: string) => {
    let updatedCards: ICard[] = [];
    let cardsIdsByStatus = {};
    let subCategories: any[] = [];
    if(parentCategory === IStatus.AVAILABILITY) {
      subCategories = [ICategory.Passive,ICategory.Active,ICategory.Open,ICategory.Not_Open,ICategory.Future];
    } else if (parentCategory === IStatus.STATUS) {
      subCategories = [ICategory.Contacted,ICategory.Interview,ICategory.Offer,ICategory.Hired,ICategory.Rejected];
    } else if (parentCategory === IStatus.TYPE) {
      subCategories = [ICategory.Part_Time,ICategory.Full_Time,ICategory.Permanent,ICategory.Contract,ICategory.Freelance];
    } else if (parentCategory === IStatus.GEOGRAPHY) {
      subCategories = [ICategory.Relocation,ICategory.Commute,ICategory.Hybrid,ICategory.Remote];
    } else if (parentCategory === IStatus.ALL) {
      subCategories = [IStatus.AVAILABILITY,IStatus.STATUS,IStatus.TYPE,IStatus.GEOGRAPHY,IStatus.GROUPS];
    } else if (parentCategory === IStatus.GROUPS) {
      subCategories = Object.keys(kanbanData[IStatus.GROUPS]);
    }
    subCategories?.forEach(value => {
      cardsIdsByStatus = {...cardsIdsByStatus, [value]:[]}
    });
    if(parentCategory === IStatus.ALL) {
      for (const [_parentStageKey, parentStage] of Object.entries(kanbanData)) {
        for (const [_stageKey, stage] of Object.entries(parentStage)) {
          for (const item of stage) {
            const cardId = item.id;
            updatedCards.push({
              id: cardId,
              profileId: item.profileId,
              category: item.category,
              title: item.name,
              description: item.name,
              status: item.status,
              name: item.name,
              designation: item.designation,
              profileImg: item.profileImg,
              hidden: false,
              companyName: item.companyName,
              conversationUrn: item.conversationUrn,
              userId: item.userId
            });
            // @ts-ignore
            if (!cardsIdsByStatus[item.status]) {
              // @ts-ignore
              cardsIdsByStatus[item.status] = [];
            }
            // @ts-ignore
            cardsIdsByStatus[item.status].push(cardId);
          }
        }
      }
    } else {
      kanbanData[parentCategory] && Object.values(kanbanData[parentCategory])?.map(stage => {
        for (const item of stage) {
          const cardId = item.id;
          updatedCards.push({
            id: cardId,
            profileId: item.profileId,
            category: item.category,
            title: item.name,
            description: item.name,
            status: item.category,
            name: item.name,
            designation: item.designation,
            profileImg: item.profileImg,
            hidden: false,
            companyName: item.companyName,
            conversationUrn: item.conversationUrn,
            userId: item.userId
          });
          // @ts-ignore
          if (!cardsIdsByStatus[item.category]) {
            // @ts-ignore
            cardsIdsByStatus[item.category] = [];
          }
          // @ts-ignore
          cardsIdsByStatus[item.category].push(cardId);
        }
      });
    }
    let updatedColumns: IColumn[] = [];
    subCategories.forEach(value => {
      updatedColumns.push(
          {
            id: value,
            title: value,
            cardsIds: cardsIdsByStatus[value]
          }
      )
    });
    dispatch(setColumns(updatedColumns));
    dispatch(setCards(updatedCards));
  }

  useEffect(() => {
    if(listView && cards?.length > 0) {
      const updatedCards = cards.reduce((accumulator, currentObject) => {
            const existingObjectIndex = accumulator.findIndex((obj) => obj.profileId === currentObject.profileId);
            if (existingObjectIndex > -1) {
              accumulator[existingObjectIndex].statuses.push(currentObject.category);
            } else {
              accumulator.push({...currentObject, statuses: [currentObject.category]});
            }
            return accumulator;
            }, []);
      dispatch(setCards(updatedCards));
    } else {
      populateKanbanData(activeButton);
    }
  },[listView,activeButton])


  const listViewClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setListView(true);
    sessionStorage.setItem("isListView", true);
  }

  const cardViewClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setListView(false);
    sessionStorage.setItem("isListView", false);
  }

  return (
    <>
      <Container>
        <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
        <Header>
          <h1 className="kanban-title">Candidates</h1>
        </Header>
        <Loader show={!completed} className="p-5 kanban-loader" heightValue="600px"/>
        {
          completed ? (
              <>
                <div className="button-container">
                    <button className={`button ${activeButton === IStatus.AVAILABILITY ? 'active' : ''}`} onClick={() => handleClick(IStatus.AVAILABILITY)}>
                      Availability
                    </button>
                    <button className={`button ${activeButton === IStatus.STATUS ? 'active' : ''}`} onClick={() => handleClick(IStatus.STATUS)}>
                      Status
                    </button>
                    <button className={`button ${activeButton === IStatus.TYPE ? 'active' : ''}`} onClick={() => handleClick(IStatus.TYPE)}>
                      Type
                    </button>
                    <button className={`button ${activeButton === IStatus.GEOGRAPHY ? 'active' : ''}`} onClick={() => handleClick(IStatus.GEOGRAPHY)}>
                      Geography
                    </button>
                    <button className={`button ${activeButton === IStatus.GROUPS ? 'active' : ''}`} onClick={() => handleClick(IStatus.GROUPS)}>
                      Groups
                    </button>
                    <div className="right-button-container">
                      <div>
                        <svg className="icon-color" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 3.5H2C1.72667 3.5 1.5 3.27333 1.5 3C1.5 2.72667 1.72667 2.5 2 2.5H14C14.2733 2.5 14.5 2.72667 14.5 3C14.5 3.27333 14.2733 3.5 14 3.5Z" fill="#585858"/>
                          <path d="M14 6.83334H2C1.72667 6.83334 1.5 6.60668 1.5 6.33334C1.5 6.06001 1.72667 5.83334 2 5.83334H14C14.2733 5.83334 14.5 6.06001 14.5 6.33334C14.5 6.60668 14.2733 6.83334 14 6.83334Z" fill="#585858"/>
                          <path d="M14 10.1667H2C1.72667 10.1667 1.5 9.93999 1.5 9.66666C1.5 9.39332 1.72667 9.16666 2 9.16666H14C14.2733 9.16666 14.5 9.39332 14.5 9.66666C14.5 9.93999 14.2733 10.1667 14 10.1667Z" fill="#585858"/>
                          <path d="M14 13.5H2C1.72667 13.5 1.5 13.2733 1.5 13C1.5 12.7267 1.72667 12.5 2 12.5H14C14.2733 12.5 14.5 12.7267 14.5 13C14.5 13.2733 14.2733 13.5 14 13.5Z" fill="#585858"/>
                        </svg>
                        <button id="kanban-list-view-btn" className={`btn list-btn ${listView ? "" : "opacity-60"}`} onClick={(event)=>listViewClickHandler(event)}>
                          List View
                        </button>
                      </div>
                      <div>
                        <svg className="icon-color" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.54 13.4533C10.3667 13.4533 10.1867 13.4467 9.99338 13.4267C9.64671 13.4 9.25338 13.3333 8.84671 13.2333L7.72671 12.9667C4.65338 12.24 3.64671 10.6133 4.36671 7.54667L5.02005 4.75333C5.16671 4.12 5.34005 3.60667 5.55338 3.18C6.70005 0.813333 8.89338 1.02667 10.4534 1.39333L11.5667 1.65333C13.1267 2.02 14.1134 2.6 14.6667 3.48667C15.2134 4.37333 15.3 5.51333 14.9334 7.07333L14.28 9.86C13.7067 12.3 12.5134 13.4533 10.54 13.4533ZM8.74671 2.16667C7.63338 2.16667 6.92671 2.62667 6.45338 3.61333C6.28005 3.97333 6.12671 4.42 5.99338 4.98L5.34005 7.77333C4.74671 10.2933 5.43338 11.3933 7.95338 11.9933L9.07338 12.26C9.43338 12.3467 9.77338 12.4 10.08 12.4267C11.8867 12.6067 12.7934 11.8133 13.3 9.63333L13.9534 6.84667C14.2534 5.56 14.2134 4.66 13.8134 4.01333C13.4134 3.36667 12.6267 2.92667 11.3334 2.62667L10.22 2.36667C9.66671 2.23333 9.17338 2.16667 8.74671 2.16667Z" fill="#909090"/>
                          <path d="M5.55353 14.8333C3.8402 14.8333 2.74686 13.8067 2.04686 11.64L1.19353 9.00667C0.246864 6.07334 1.09353 4.42 4.01353 3.47334L5.06686 3.13334C5.41353 3.02667 5.67353 2.95334 5.90686 2.91334C6.09353 2.87334 6.28686 2.94667 6.4002 3.1C6.51353 3.25334 6.53353 3.45334 6.45353 3.62667C6.2802 3.98 6.12686 4.42667 6.0002 4.98667L5.34686 7.78C4.75353 10.3 5.4402 11.4 7.9602 12L9.0802 12.2667C9.4402 12.3533 9.7802 12.4067 10.0869 12.4333C10.3002 12.4533 10.4735 12.6 10.5335 12.8067C10.5869 13.0133 10.5069 13.2267 10.3335 13.3467C9.89353 13.6467 9.3402 13.9 8.6402 14.1267L7.58686 14.4733C6.8202 14.7133 6.15353 14.8333 5.55353 14.8333ZM5.18686 4.14667L4.32686 4.42667C1.94686 5.19334 1.3802 6.31334 2.14686 8.7L3.0002 11.3333C3.77353 13.7133 4.89353 14.2867 7.27353 13.52L8.32686 13.1733C8.36686 13.16 8.4002 13.1467 8.4402 13.1333L7.73353 12.9667C4.6602 12.24 3.65353 10.6133 4.37353 7.54667L5.02686 4.75334C5.07353 4.54 5.12686 4.33334 5.18686 4.14667Z" fill="#909090"/>
                        </svg>
                        <button className={`btn card-btn ${listView ? "opacity-60" : ""}`} onClick={(event) => cardViewClickHandler(event)}>
                          Card View
                        </button>
                      </div>
                    </div>
                </div>
                {
                  listView?
                      (
                          <>
                            <ListView cards={cards} parentTheme={theme}/>
                          </>
                      ):(
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
                      )
                }
              </>
          ) : null
        }
      </Container>
    </>
  )
}

export default KanbanBoard;
