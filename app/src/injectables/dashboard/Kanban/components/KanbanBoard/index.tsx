/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../../../../../global";
import {getAuthorStages, getCustomStages, postNote, setStageFromKanban} from "../../../../../actions";
import {Loader} from "../../../../../components/Loader";
import {StageEnum, StageLabels} from "../../../../notes/StageSwitch";

const KanbanBoard: React.FC<KanbanBoardProps> = () => {
  const { cards } = useAppSelector((state => state.cards));
  const { columns } = useAppSelector((state => state.columns));
  const { visible } = useModal();
  const [activeButton, setActiveButton] = useState(IStatus.ALL);
  const [selectedCategories] = useState<ICategory[]>(Object.values(ICategory));
  const messages = new MessagesV2(VERBOSE);
  const dispatch = useAppDispatch();
  const [completed, setCompleted] = useState(false);
  const [kanbanData, setKanbanData] = useState({});
  const [listView, setListView] = useState(true);
  const [completed2, setCompleted2] = useState(false);

  useEffect(() => {
    messages.request(getAuthorStages())
        .then((resp) => {
          if (resp.data) {
            setKanbanData(resp.data);
            setCompleted(true);
          }
        });
  },[]);

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
    populateKanbanData(IStatus.ALL);
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
    dispatch(setColumns(updatedColumns))
    dispatch(setCards(updatedCards))
    if(activeButton === IStatus.GROUPS) {
      messages.request(setStageFromKanban({id: draggableId, stage: Object.values(ICategory).indexOf(destination.droppableId), stageText: destination.droppableId})).then((_r) => {console.log(_r)});
    } else {
      messages.request(setStageFromKanban({id: draggableId, stage: Object.values(ICategory).indexOf(destination.droppableId)})).then((_r) => {console.log(_r)});
    }
    messages.request(postNote({id: draggableId, stageFrom: Object.values(ICategory).indexOf(source.droppableId) ,stageTo:Object.values(ICategory).indexOf(destination.droppableId)})).then((_r) => {console.log(_r)});
  }
  useEffect(() => {
    dispatch(filterCards({categories: selectedCategories}))
  }, [selectedCategories]);
  function handleClick(button: string) {
    populateKanbanData(button);
    setActiveButton(button);
  }
  const populateKanbanData = (parentCategory: string) => {
    const updatedCards: ICard[] = [];
    let cardsIdsByStatus = {};
    let subCategories = [];
    if(parentCategory === IStatus.AVAILABILITY) {
      subCategories = [ICategory.Passive_Candidate,ICategory.Actively_Looking,ICategory.Open_To_New_Offers,ICategory.Not_Looking_Currently,ICategory.Future_Interest];
    } else if (parentCategory === IStatus.STATUS) {
      subCategories = [ICategory.Contacted,ICategory.Pending_Response,ICategory.Interview_Scheduled,ICategory.Offer_Extended,ICategory.Hired,ICategory.Rejected];
    } else if (parentCategory === IStatus.TYPE) {
      subCategories = [ICategory.Part_Time,ICategory.Full_Time,ICategory.Permanent,ICategory.Contract,ICategory.Freelance];
    } else if (parentCategory === IStatus.GEOGRAPHY) {
      subCategories = [ICategory.Relocation,ICategory.Commute,ICategory.Hybrid,ICategory.Remote];
    } else if (parentCategory === IStatus.ALL) {
      subCategories = [IStatus.AVAILABILITY,IStatus.STATUS,IStatus.TYPE,IStatus.GEOGRAPHY,IStatus.GROUPS];
    } else if (parentCategory === IStatus.GROUPS) {
      subCategories = Object.keys(kanbanData[IStatus.GROUPS]);
    }
    subCategories.forEach(value => {
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
              hidden: false
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
            hidden: false
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

  return (
    <>
      <Container>
        <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
        <Header>
          <h1 className="kanban-title">Candidates</h1>
          <button className="share-button">
            <svg width="15" height="15" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.8638 6.0957L8.2211 10.7384C8.15617 10.8034 8.07341 10.8477 7.9833 10.8657C7.89319 10.8836 7.79978 10.8744 7.7149 10.8392C7.63002 10.8041 7.55749 10.7445 7.50648 10.6681C7.45547 10.5917 7.42828 10.5018 7.42835 10.41V8.10195C4.11459 8.28998 1.84255 10.439 1.20476 11.1197C1.10461 11.2267 0.973274 11.2993 0.829449 11.3273C0.685624 11.3553 0.536635 11.3372 0.403684 11.2756C0.270733 11.214 0.160596 11.1121 0.0889451 10.9843C0.0172946 10.8565 -0.012218 10.7093 0.00460746 10.5638C0.219915 8.69158 1.24538 6.89077 2.89239 5.49331C4.26026 4.33262 5.92294 3.59617 7.42835 3.46733V1.12449C7.42828 1.03261 7.45547 0.942779 7.50648 0.866363C7.55749 0.789946 7.63002 0.730382 7.7149 0.695212C7.79978 0.660043 7.89319 0.650848 7.9833 0.668792C8.07341 0.686737 8.15617 0.731013 8.2211 0.796017L12.8638 5.43876C12.907 5.48187 12.9412 5.53308 12.9646 5.58944C12.988 5.6458 13 5.70622 13 5.76723C13 5.82824 12.988 5.88866 12.9646 5.94502C12.9412 6.00138 12.907 6.05259 12.8638 6.0957Z" fill="#585858"/>
            </svg>
            <span>Share</span>
          </button>
          <h3 className="shared-title">Shared with: </h3>
        </Header>
        {/*<Loader show={!completed} className="p-5 kanban-loader" heightValue="600px"/>*/}
        {
          completed ? (
              <>
                <div className="button-container">
                    <button className={`button ${activeButton === IStatus.ALL ? 'active' : ''}`} onClick={() => handleClick(IStatus.ALL)}>
                      All
                    </button>
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
                    <div>
                      <button className={`button ${activeButton === IStatus.GEOGRAPHY ? 'active' : ''}`} onClick={() => handleClick(IStatus.GEOGRAPHY)}>
                        List View
                      </button>
                      <button className={`button ${activeButton === IStatus.GEOGRAPHY ? 'active' : ''}`} onClick={() => handleClick(IStatus.GEOGRAPHY)}>
                        Grid View
                      </button>
                    </div>
                  </div>

                {
                  listView?
                      (
                          <>
                            <div className="body2">
                                    <table className="table table-striped jobs-table table-custom">
                                      <thead>
                                      <tr>
                                        <th scope="col" className="job-column job-table-heading">Full Name</th>
                                        <th scope="col" className="job-column job-table-heading">Position</th>
                                        <th scope="col" className="job-column job-table-heading">Company Name</th>
                                        <th scope="col" className="job-column job-table-heading">Status</th>
                                        <th scope="col" className="job-column job-table-heading">Action</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      {
                                        <tr className="job-column job-table-row">
                                          <td>
                                            <img src="./icon-16.png" alt="img" width={40} height={40} style={{borderRadius:"100%"}} />
                                            <span>Saif Ali</span>
                                          </td>
                                          <td>
                                            2
                                          </td>
                                          <td>
                                            3
                                          </td>
                                          <td>
                                            4
                                          </td>
                                          <td>
                                            5
                                          </td>
                                          <td>
                                            <button>
                                              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12.4917 0.666687H5.50841C2.47508 0.666687 0.666748 2.47502 0.666748 5.50835V12.4834C0.666748 15.525 2.47508 17.3334 5.50841 17.3334H12.4834C15.5167 17.3334 17.3251 15.525 17.3251 12.4917V5.50835C17.3334 2.47502 15.5251 0.666687 12.4917 0.666687ZM8.12508 13.5917C7.88341 13.8334 7.42508 14.0667 7.09175 14.1167L5.04175 14.4084C4.96675 14.4167 4.89175 14.425 4.81675 14.425C4.47508 14.425 4.15841 14.3084 3.93341 14.0834C3.65841 13.8084 3.54175 13.4084 3.60841 12.9667L3.90008 10.9167C3.95008 10.575 4.17508 10.125 4.42508 9.88335L8.14175 6.16669C8.20841 6.34169 8.27508 6.51669 8.36675 6.71669C8.45008 6.89169 8.54175 7.07502 8.64175 7.24169C8.72508 7.38335 8.81675 7.51669 8.89175 7.61669C8.98341 7.75835 9.09175 7.89169 9.15841 7.96669C9.20008 8.02502 9.23341 8.06669 9.25008 8.08335C9.45842 8.33335 9.70008 8.56669 9.90841 8.74169C9.96675 8.80002 10.0001 8.83335 10.0167 8.84169C10.1417 8.94169 10.2667 9.04169 10.3751 9.11669C10.5084 9.21669 10.6417 9.30835 10.7834 9.38335C10.9501 9.48335 11.1334 9.57502 11.3167 9.66669C11.5084 9.75002 11.6834 9.82502 11.8584 9.88335L8.12508 13.5917ZM13.4751 8.24169L12.7084 9.01669C12.6584 9.06669 12.5917 9.09169 12.5251 9.09169C12.5001 9.09169 12.4667 9.09169 12.4501 9.08335C10.7584 8.60002 9.40841 7.25002 8.92508 5.55835C8.90008 5.46669 8.92508 5.36669 8.99175 5.30835L9.76675 4.53335C11.0334 3.26669 12.2417 3.29169 13.4834 4.53335C14.1167 5.16669 14.4251 5.77502 14.4251 6.40835C14.4167 7.00835 14.1084 7.60835 13.4751 8.24169Z" fill="#909090"/>
                                              </svg>
                                            </button>
                                            <button>
                                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.5584 4.35835C16.2167 4.22502 14.875 4.12502 13.525 4.05002V4.04169L13.3417 2.95835C13.2167 2.19169 13.0334 1.04169 11.0834 1.04169H8.90005C6.95838 1.04169 6.77505 2.14169 6.64172 2.95002L6.46672 4.01669C5.69172 4.06669 4.91672 4.11669 4.14172 4.19169L2.44172 4.35835C2.09172 4.39169 1.84172 4.70002 1.87505 5.04169C1.90838 5.38335 2.20838 5.63335 2.55838 5.60002L4.25838 5.43335C8.62505 5.00002 13.0251 5.16669 17.4417 5.60835C17.4667 5.60835 17.4834 5.60835 17.5084 5.60835C17.8251 5.60835 18.1 5.36669 18.1334 5.04169C18.1584 4.70002 17.9084 4.39169 17.5584 4.35835Z" fill="#909090"/>
                                                <path d="M16.025 6.78331C15.825 6.57498 15.55 6.45831 15.2666 6.45831H4.73329C4.44995 6.45831 4.16662 6.57498 3.97495 6.78331C3.78329 6.99165 3.67495 7.27498 3.69162 7.56665L4.20829 16.1166C4.29995 17.3833 4.41662 18.9666 7.32495 18.9666H12.675C15.5833 18.9666 15.7 17.3916 15.7916 16.1166L16.3083 7.57498C16.325 7.27498 16.2166 6.99165 16.025 6.78331ZM11.3833 14.7916H8.60829C8.26662 14.7916 7.98329 14.5083 7.98329 14.1666C7.98329 13.825 8.26662 13.5416 8.60829 13.5416H11.3833C11.725 13.5416 12.0083 13.825 12.0083 14.1666C12.0083 14.5083 11.725 14.7916 11.3833 14.7916ZM12.0833 11.4583H7.91662C7.57495 11.4583 7.29162 11.175 7.29162 10.8333C7.29162 10.4916 7.57495 10.2083 7.91662 10.2083H12.0833C12.425 10.2083 12.7083 10.4916 12.7083 10.8333C12.7083 11.175 12.425 11.4583 12.0833 11.4583Z" fill="#909090"/>
                                              </svg>
                                            </button>
                                          </td>
                                        </tr>
                                      }
                                      </tbody>
                                    </table>
                            </div>
                          </>
                      ):(<StatusesColumnsContainer>
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
                  </StatusesColumnsContainer>)
                }
              </>
          ) : null
        }
      </Container>
      <Modal visible={visible}/>
    </>
  )
}

export default KanbanBoard;