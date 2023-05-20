import { createSlice } from "@reduxjs/toolkit"
type AvailabilityStatus = "Not_Open" | "Open" | "Passive" | "Active" | "Future"
type StatusStatus = "Hired" | "Contacted" | "Interview" | "Offer" | "Rejected"
type TypeStatus =
  | "Part_Time"
  | "Full_Time"
  | "Permanent"
  | "Contract"
  | "Freelance"
type GeographyStatus = "Relocate" | "Commute" | "Remote" | "Hybrid"
type GroupsStatus = string

type AllStatus =
  | AvailabilityStatus
  | StatusStatus
  | TypeStatus
  | GeographyStatus

type Person = {
  name: string
  designation: string
  id: string
  profileId: string
  profileImg: string
  status: AllStatus
  category: AllStatus
  companyName: string
  conversationUrn: string
  userId: string
}

type IKanbanData = {
  AVAILABILITY: {
    [key in AvailabilityStatus]: Person[]
  }
  GEOGRAPHY: {
    [key in GeographyStatus]: Person[]
  }
  GROUPS: {
    [key in GroupsStatus]: Person[]
  }
  STATUS: {
    [key in StatusStatus]: Person[]
  }
  TYPE: {
    [key in TypeStatus]: Person[]
  }
}

interface KanbanSliceState {
  kanbanData: IKanbanData
}

const initialState: KanbanSliceState = {
  kanbanData: {} as IKanbanData,
}

export const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    setKanbanData: (state, action) => {
      state.kanbanData = action.payload as IKanbanData
    },
    removeCard: (state, action) => {
      const { parent, label, userId } = action.payload as {
        parent: keyof IKanbanData
        label: keyof IKanbanData[keyof IKanbanData]
        userId: string
      }
      // if parent is not there return
      if (!state.kanbanData[parent]) {
        return
      }
      // if label is not there return
      if (!state.kanbanData[parent][label]) {
        return
      }
      // if id is not there return
      if (
        !(state.kanbanData[parent][label] as Person[]).find(
          (card: any) => card.userId === userId
        )
      ) {

        return
      }
      // delete the card
      state.kanbanData = {
        ...state.kanbanData,
        [parent]: {
          ...state.kanbanData[parent],
          [label]: (state.kanbanData[parent][label] as Person[]).filter(
            (card: any) => card.userId !== userId
          ),
        },
      }
    },
    addCard: (state, action) => {
      const { parent, label, card } = action.payload as {
        parent: keyof IKanbanData
        label: keyof IKanbanData[keyof IKanbanData]
        card: Person
      }

      // if parent is not there return
      if (!state.kanbanData[parent]) {
        // create parent
        state.kanbanData = {
          ...state.kanbanData,
          [parent]: {},
        }
      }
      // if label is not there return
      if (!state.kanbanData[parent][label]) {
        // create label
        state.kanbanData = {
          ...state.kanbanData,
          [parent]: {
            ...state.kanbanData[parent],
            [label]: [],
          },
        }
      }
      // if card is not there return
      if (!card) {
        return
      }
      // add the card
      state.kanbanData = {
        ...state.kanbanData,
        [parent]: {
          ...state.kanbanData[parent],
          [label]: [...state.kanbanData[parent][label], card],
        },
      }
    },
    updateCard: (state, action) => {
      let { parent, label, card } = action.payload
      label = label.replace(/ /g, "_")
      // if parent is not there return
      if (!state.kanbanData[parent as keyof IKanbanData]) {
        // create parent
        state.kanbanData = {
          ...state.kanbanData,
          [parent]: {},
        }
      }
      // if label is not there return
      if (
        !state.kanbanData[parent as keyof IKanbanData][
          label as keyof IKanbanData[keyof IKanbanData]
        ]
      ) {
        // create label
        state.kanbanData = {
          ...state.kanbanData,
          [parent]: {
            ...state.kanbanData[parent as keyof IKanbanData],
            [label]: [],
          },
        }
      }
      // if card is not there return
      if (!card) {
        return
      }

      // get parent
      const categories = state.kanbanData[parent as keyof IKanbanData]

      Object.keys(categories).forEach((category) => {
        const cards =
          categories[
            category as keyof IKanbanData[keyof IKanbanData] as keyof IKanbanData[keyof IKanbanData]
          ]
        const newCards = (cards as Person[]).filter(
          (c: any) => c.userId !== card.userId
        )
        state.kanbanData = {
          ...state.kanbanData,
          [parent]: {
            ...state.kanbanData[parent as keyof IKanbanData],
            [category]: newCards,
          },
        }
      })

      // add the card
      state.kanbanData = {
        ...state.kanbanData,
        [parent]: {
          ...state.kanbanData[parent as keyof IKanbanData],
          [label]: [
            ...state.kanbanData[parent as keyof IKanbanData][
              label as keyof IKanbanData[keyof IKanbanData]
            ],
            card,
          ],
        },
      }
    },
    moveCard: (state, action) => {
      const { parent, source, destination, card } = action.payload as {
        parent: keyof IKanbanData
        source: {
          index: number
          droppableId: AllStatus
        }
        destination: {
          index: number
          droppableId: AllStatus
        }
        card: Person
      }

      const formattedSourceDroppableId = parent !== 'GROUPS' ? source.droppableId.replace(/ /g, "_") : source.droppableId
      const formattedDestinationDroppableId = parent !== 'GROUPS' ? destination.droppableId.replace(
        / /g,
        "_"
      ) : destination.droppableId


      // if parent is not there return
      if (!state.kanbanData[parent]) {
        // create parent
        state.kanbanData = {
          ...state.kanbanData,
          [parent]: {},
        }
      }

      // if source is not there return
      // @ts-ignore
      if (!state.kanbanData[parent][formattedSourceDroppableId as AllStatus]) {

        // create source
        state.kanbanData = {
          ...state.kanbanData,
          [parent]: {
            ...state.kanbanData[parent],
            [formattedSourceDroppableId]: [],
          },
        }
      }

      // if destination is not there return
      // @ts-ignore
      if (!state.kanbanData[parent][formattedDestinationDroppableId]) {

        // create destination
        state.kanbanData = {
          ...state.kanbanData,
          [parent]: {
            ...state.kanbanData[parent],
            [formattedDestinationDroppableId]: [],
          },
        }
      }

      // if card is not there return
      if (!card) {
        return
      }

      // get source
      // @ts-ignore
      const sourceCards = state.kanbanData[parent][formattedSourceDroppableId]
      // get destination
      // @ts-ignore
      const destinationCards = state.kanbanData[parent][
        formattedDestinationDroppableId
      ] as Person[]


      // remove card from source
      const newSourceCards =
        parent !== "GEOGRAPHY" && parent !== "GROUPS"
          ? (sourceCards as Person[]).filter(
              (c: Person) => c.userId !== card.userId
            )
          : (sourceCards as Person[])


      // add card to destination
      destinationCards.splice(destination.index, 0, {
        ...card,
        category: destination.droppableId,
        status: destination.droppableId,
      })


      // update source
      state.kanbanData = {
        ...state.kanbanData,
        [parent]: {
          ...state.kanbanData[parent],
          [formattedSourceDroppableId]: newSourceCards,
        },
      }

      // update destination
      state.kanbanData = {
        ...state.kanbanData,
        [parent]: {
          ...state.kanbanData[parent],
          [formattedDestinationDroppableId]: destinationCards,
        },
      }

    },
    updateCardIdByOptimisticId: (state, action) => {
      const { parent, label, id, optimisticId } = action.payload as {
        parent: keyof IKanbanData
        label: keyof IKanbanData[keyof IKanbanData]
        id: string
        optimisticId: string
      }


      ;(state.kanbanData[parent][label] as Person[]).forEach((card: any) => {
        if (card.userId === optimisticId) {
          card.userId = id
        }
      })
    },
  },
})

export const {
  setKanbanData,
  removeCard,
  addCard,
  updateCard,
  moveCard,
  updateCardIdByOptimisticId,
} = kanbanSlice.actions

export default kanbanSlice.reducer
