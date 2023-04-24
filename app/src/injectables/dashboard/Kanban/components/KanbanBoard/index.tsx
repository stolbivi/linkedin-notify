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
import Badge from "../Badge";

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
  const [listView, setListView] = useState(false);

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
    let updatedCards: ICard[] = [];
    let cardsIdsByStatus = {};
    let subCategories = [];
    if(parentCategory === IStatus.AVAILABILITY) {
      subCategories = [ICategory.Passive,ICategory.Active,ICategory.Open,ICategory.Not_Open,ICategory.Future];
    } else if (parentCategory === IStatus.STATUS) {
      subCategories = [ICategory.Contacted,ICategory.Pending,ICategory.Interview,ICategory.Offer,ICategory.Hired,ICategory.Rejected];
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
              hidden: false,
              companyName: item.companyName,
              conversationUrn: item.conversationUrn
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
            conversationUrn: item.conversationUrn
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
    }
  },[listView,activeButton])

  function messagesClickHandler(conversationUrn) {
    let messageUrl = 'https://www.linkedin.com/messaging/thread/new/';
    if(conversationUrn) {
      messageUrl = `https://www.linkedin.com/messaging/thread/${conversationUrn}`
    }
    window.open(messageUrl, '_blank')
  }

  return (
    <>
      <Container>
        <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
        <Header>
          <h1 className="kanban-title">Candidates</h1>
        {/*          <button className="share-button">
            <svg width="15" height="15" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.8638 6.0957L8.2211 10.7384C8.15617 10.8034 8.07341 10.8477 7.9833 10.8657C7.89319 10.8836 7.79978 10.8744 7.7149 10.8392C7.63002 10.8041 7.55749 10.7445 7.50648 10.6681C7.45547 10.5917 7.42828 10.5018 7.42835 10.41V8.10195C4.11459 8.28998 1.84255 10.439 1.20476 11.1197C1.10461 11.2267 0.973274 11.2993 0.829449 11.3273C0.685624 11.3553 0.536635 11.3372 0.403684 11.2756C0.270733 11.214 0.160596 11.1121 0.0889451 10.9843C0.0172946 10.8565 -0.012218 10.7093 0.00460746 10.5638C0.219915 8.69158 1.24538 6.89077 2.89239 5.49331C4.26026 4.33262 5.92294 3.59617 7.42835 3.46733V1.12449C7.42828 1.03261 7.45547 0.942779 7.50648 0.866363C7.55749 0.789946 7.63002 0.730382 7.7149 0.695212C7.79978 0.660043 7.89319 0.650848 7.9833 0.668792C8.07341 0.686737 8.15617 0.731013 8.2211 0.796017L12.8638 5.43876C12.907 5.48187 12.9412 5.53308 12.9646 5.58944C12.988 5.6458 13 5.70622 13 5.76723C13 5.82824 12.988 5.88866 12.9646 5.94502C12.9412 6.00138 12.907 6.05259 12.8638 6.0957Z" fill="#585858"/>
            </svg>
            <span>Share</span>
          </button>
          <h3 className="shared-title">Shared with: </h3>*/}
        </Header>
        <Loader show={!completed} className="p-5 kanban-loader" heightValue="600px"/>
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
                    <div className="right-button-container">
                      <div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 3.5H2C1.72667 3.5 1.5 3.27333 1.5 3C1.5 2.72667 1.72667 2.5 2 2.5H14C14.2733 2.5 14.5 2.72667 14.5 3C14.5 3.27333 14.2733 3.5 14 3.5Z" fill="#585858"/>
                          <path d="M14 6.83334H2C1.72667 6.83334 1.5 6.60668 1.5 6.33334C1.5 6.06001 1.72667 5.83334 2 5.83334H14C14.2733 5.83334 14.5 6.06001 14.5 6.33334C14.5 6.60668 14.2733 6.83334 14 6.83334Z" fill="#585858"/>
                          <path d="M14 10.1667H2C1.72667 10.1667 1.5 9.93999 1.5 9.66666C1.5 9.39332 1.72667 9.16666 2 9.16666H14C14.2733 9.16666 14.5 9.39332 14.5 9.66666C14.5 9.93999 14.2733 10.1667 14 10.1667Z" fill="#585858"/>
                          <path d="M14 13.5H2C1.72667 13.5 1.5 13.2733 1.5 13C1.5 12.7267 1.72667 12.5 2 12.5H14C14.2733 12.5 14.5 12.7267 14.5 13C14.5 13.2733 14.2733 13.5 14 13.5Z" fill="#585858"/>
                        </svg>
                        <button className="btn list-btn" onClick={() => setListView(true)}>
                          List View
                        </button>
                      </div>
                      <div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.54 13.4533C10.3667 13.4533 10.1867 13.4467 9.99338 13.4267C9.64671 13.4 9.25338 13.3333 8.84671 13.2333L7.72671 12.9667C4.65338 12.24 3.64671 10.6133 4.36671 7.54667L5.02005 4.75333C5.16671 4.12 5.34005 3.60667 5.55338 3.18C6.70005 0.813333 8.89338 1.02667 10.4534 1.39333L11.5667 1.65333C13.1267 2.02 14.1134 2.6 14.6667 3.48667C15.2134 4.37333 15.3 5.51333 14.9334 7.07333L14.28 9.86C13.7067 12.3 12.5134 13.4533 10.54 13.4533ZM8.74671 2.16667C7.63338 2.16667 6.92671 2.62667 6.45338 3.61333C6.28005 3.97333 6.12671 4.42 5.99338 4.98L5.34005 7.77333C4.74671 10.2933 5.43338 11.3933 7.95338 11.9933L9.07338 12.26C9.43338 12.3467 9.77338 12.4 10.08 12.4267C11.8867 12.6067 12.7934 11.8133 13.3 9.63333L13.9534 6.84667C14.2534 5.56 14.2134 4.66 13.8134 4.01333C13.4134 3.36667 12.6267 2.92667 11.3334 2.62667L10.22 2.36667C9.66671 2.23333 9.17338 2.16667 8.74671 2.16667Z" fill="#909090"/>
                          <path d="M5.55353 14.8333C3.8402 14.8333 2.74686 13.8067 2.04686 11.64L1.19353 9.00667C0.246864 6.07334 1.09353 4.42 4.01353 3.47334L5.06686 3.13334C5.41353 3.02667 5.67353 2.95334 5.90686 2.91334C6.09353 2.87334 6.28686 2.94667 6.4002 3.1C6.51353 3.25334 6.53353 3.45334 6.45353 3.62667C6.2802 3.98 6.12686 4.42667 6.0002 4.98667L5.34686 7.78C4.75353 10.3 5.4402 11.4 7.9602 12L9.0802 12.2667C9.4402 12.3533 9.7802 12.4067 10.0869 12.4333C10.3002 12.4533 10.4735 12.6 10.5335 12.8067C10.5869 13.0133 10.5069 13.2267 10.3335 13.3467C9.89353 13.6467 9.3402 13.9 8.6402 14.1267L7.58686 14.4733C6.8202 14.7133 6.15353 14.8333 5.55353 14.8333ZM5.18686 4.14667L4.32686 4.42667C1.94686 5.19334 1.3802 6.31334 2.14686 8.7L3.0002 11.3333C3.77353 13.7133 4.89353 14.2867 7.27353 13.52L8.32686 13.1733C8.36686 13.16 8.4002 13.1467 8.4402 13.1333L7.73353 12.9667C4.6602 12.24 3.65353 10.6133 4.37353 7.54667L5.02686 4.75334C5.07353 4.54 5.12686 4.33334 5.18686 4.14667Z" fill="#909090"/>
                        </svg>
                        <button className="btn card-btn" onClick={() => setListView(false)}>
                          Card View
                        </button>
                      </div>
                      <button className="share-button">
                        <svg style={{marginRight:"23px"}} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.3332 8H5.6665C5.39317 8 5.1665 7.77333 5.1665 7.5C5.1665 7.22667 5.39317 7 5.6665 7H10.3332C10.6065 7 10.8332 7.22667 10.8332 7.5C10.8332 7.77333 10.6065 8 10.3332 8Z" fill="#585858"/>
                          <path d="M10.6668 15.38C10.4402 15.38 10.2135 15.3133 10.0202 15.1866L7.18016 13.2933H4.66683C2.3735 13.2933 0.833496 11.7533 0.833496 9.45995V5.45995C0.833496 3.16662 2.3735 1.62662 4.66683 1.62662H11.3335C13.6268 1.62662 15.1668 3.16662 15.1668 5.45995V9.45995C15.1668 11.58 13.8468 13.06 11.8335 13.2666V14.2133C11.8335 14.6466 11.6002 15.0399 11.2202 15.2399C11.0468 15.3333 10.8535 15.38 10.6668 15.38ZM4.66683 2.61994C2.94683 2.61994 1.8335 3.73328 1.8335 5.45328V9.45328C1.8335 11.1733 2.94683 12.2866 4.66683 12.2866H7.3335C7.4335 12.2866 7.52684 12.3133 7.61351 12.3733L10.5802 14.3466C10.6535 14.3933 10.7202 14.3733 10.7535 14.3533C10.7868 14.3333 10.8402 14.2933 10.8402 14.2066V12.7866C10.8402 12.5133 11.0668 12.2866 11.3402 12.2866C13.0602 12.2866 14.1735 11.1733 14.1735 9.45328V5.45328C14.1735 3.73328 13.0602 2.61994 11.3402 2.61994H4.66683Z" fill="#585858"/>
                        </svg>
                        <span style={{marginRight:"17px"}}>Message</span>
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
                                          <th scope="col" className="job-column job-table-heading"/>
                                          <th scope="col" className="job-column job-table-heading" style={{textAlign: "center !important"}}>Full Name</th>
                                          <th scope="col" className="job-column job-table-heading">Position</th>
                                          <th scope="col" className="job-column job-table-heading">Company Name</th>
                                          <th scope="col" className="job-column job-table-heading">Status</th>
                                          <th scope="col" className="job-column job-table-heading" style={{textAlign: "center !important"}}>Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                      {
                                        cards.map((card) => (
                                            <tr className="job-column job-table-row" key={card.id}>
                                              <td>
                                                <input type="checkbox" id="list-view-checkbox"/>
                                              </td>
                                              <td>
                                                <img src={card.profileImg} alt="img" width={30} height={30} style={{borderRadius:"100%"}} />
                                                <span style={{padding: "4%"}}>{card.name}</span>
                                              </td>
                                              <td>
                                                {card.designation?.substring(0, 20) + "..."}
                                              </td>
                                              <td>
                                                {card.companyName?.substring(0, 20) + "..."}
                                              </td>
                                              <td style={{display: "flex", alignItems: "center"}}>
                                                {card?.statuses?.map((category,index) => (
                                                  <Badge category={category} key={category+index}/>
                                                ))}
                                              </td>
                                              <td>
                                                <button className="btn" onClick={()=>messagesClickHandler(card.conversationUrn)}>
                                                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10.3332 8H5.6665C5.39317 8 5.1665 7.77333 5.1665 7.5C5.1665 7.22667 5.39317 7 5.6665 7H10.3332C10.6065 7 10.8332 7.22667 10.8332 7.5C10.8332 7.77333 10.6065 8 10.3332 8Z" fill="#585858"/>
                                                    <path d="M10.6668 15.3799C10.4402 15.3799 10.2135 15.3133 10.0202 15.1866L7.18016 13.2933H4.66683C2.3735 13.2933 0.833496 11.7533 0.833496 9.45992V5.45992C0.833496 3.16659 2.3735 1.62659 4.66683 1.62659H11.3335C13.6268 1.62659 15.1668 3.16659 15.1668 5.45992V9.45992C15.1668 11.5799 13.8468 13.0599 11.8335 13.2666V14.2133C11.8335 14.6466 11.6002 15.0399 11.2202 15.2399C11.0468 15.3332 10.8535 15.3799 10.6668 15.3799ZM4.66683 2.61991C2.94683 2.61991 1.8335 3.73325 1.8335 5.45325V9.45325C1.8335 11.1732 2.94683 12.2866 4.66683 12.2866H7.3335C7.4335 12.2866 7.52684 12.3132 7.61351 12.3733L10.5802 14.3466C10.6535 14.3933 10.7202 14.3733 10.7535 14.3533C10.7868 14.3333 10.8402 14.2932 10.8402 14.2066V12.7866C10.8402 12.5132 11.0668 12.2866 11.3402 12.2866C13.0602 12.2866 14.1735 11.1732 14.1735 9.45325V5.45325C14.1735 3.73325 13.0602 2.61991 11.3402 2.61991H4.66683Z" fill="#585858"/>
                                                  </svg>
                                                  <span style={{paddingLeft: "3px"}}>Message</span>
                                                </button>
                                                <button className="btn">
                                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10.6665 15.1667H5.33317C3.31984 15.1667 2.1665 14.0134 2.1665 12V5.50004C2.1665 3.40004 3.23317 2.33337 5.33317 2.33337C5.6065 2.33337 5.83317 2.56004 5.83317 2.83337C5.83317 3.10004 5.93984 3.35337 6.12651 3.54004C6.31317 3.72671 6.5665 3.83337 6.83317 3.83337H9.1665C9.71984 3.83337 10.1665 3.38671 10.1665 2.83337C10.1665 2.56004 10.3932 2.33337 10.6665 2.33337C12.7665 2.33337 13.8332 3.40004 13.8332 5.50004V12C13.8332 14.0134 12.6798 15.1667 10.6665 15.1667ZM4.89982 3.34671C3.84649 3.43338 3.1665 3.90671 3.1665 5.50004V12C3.1665 13.48 3.85317 14.1667 5.33317 14.1667H10.6665C12.1465 14.1667 12.8332 13.48 12.8332 12V5.50004C12.8332 3.90671 12.1532 3.44004 11.0999 3.34671C10.8732 4.20004 10.0932 4.83337 9.1665 4.83337H6.83317C6.29984 4.83337 5.79984 4.6267 5.41984 4.2467C5.16651 3.99337 4.99315 3.68671 4.89982 3.34671Z" fill="#585858"/>
                                                    <path d="M9.16683 4.83337H6.8335C6.30016 4.83337 5.80017 4.6267 5.42017 4.2467C5.04017 3.8667 4.8335 3.36671 4.8335 2.83337C4.8335 1.73337 5.7335 0.833374 6.8335 0.833374H9.16683C9.70016 0.833374 10.2002 1.04004 10.5802 1.42004C10.9602 1.80004 11.1668 2.30004 11.1668 2.83337C11.1668 3.93337 10.2668 4.83337 9.16683 4.83337ZM6.8335 1.83337C6.28016 1.83337 5.8335 2.28004 5.8335 2.83337C5.8335 3.10004 5.94016 3.35337 6.12683 3.54004C6.3135 3.72671 6.56683 3.83337 6.8335 3.83337H9.16683C9.72016 3.83337 10.1668 3.38671 10.1668 2.83337C10.1668 2.56671 10.0602 2.31338 9.87349 2.12671C9.68683 1.94004 9.4335 1.83337 9.16683 1.83337H6.8335Z" fill="#585858"/>
                                                    <path d="M8.00016 9.16663H5.3335C5.06016 9.16663 4.8335 8.93996 4.8335 8.66663C4.8335 8.39329 5.06016 8.16663 5.3335 8.16663H8.00016C8.2735 8.16663 8.50016 8.39329 8.50016 8.66663C8.50016 8.93996 8.2735 9.16663 8.00016 9.16663Z" fill="#585858"/>
                                                    <path d="M10.6668 11.8334H5.3335C5.06016 11.8334 4.8335 11.6067 4.8335 11.3334C4.8335 11.06 5.06016 10.8334 5.3335 10.8334H10.6668C10.9402 10.8334 11.1668 11.06 11.1668 11.3334C11.1668 11.6067 10.9402 11.8334 10.6668 11.8334Z" fill="#585858"/>
                                                  </svg>
                                                  <span style={{paddingLeft: "3px"}}>Notes</span>
                                                </button>
                                              </td>
                                            </tr>
                                        ))
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