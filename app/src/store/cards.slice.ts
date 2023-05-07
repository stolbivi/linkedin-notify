import { createSlice } from "@reduxjs/toolkit";
import mockCards from "../../src/injectables/dashboard/Kanban/data/cards";
import ICard from "../../src/injectables/dashboard/Kanban/interfaces/ICard";
import ICategory from "../../src/injectables/dashboard/Kanban/interfaces/ICategory";

interface CardsSliceState {
  cards: ICard[],
  searchText: string
}

const initialState: CardsSliceState = {
  cards: mockCards,
  searchText: ''
}

export const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCards: (state, action) => {
      state.cards = action.payload
    },
    setSearchText: (state, action) => {
      state.searchText = action.payload
    },
    addCard: (state, action) => {
      const card = action.payload

      state.cards = [...state.cards, card]
    },
    updateOneCard: (state, action) => {
      const cardId = action.payload.id;

      const updatedCards = state.cards.map(card => {
        if (card.id === cardId) return action.payload;
        else return card;
      })

      state.cards = updatedCards;
    },
    filterCards: (state, action) => {
      const searchText = state.searchText;
      const categories = action.payload.categories || Object.values(ICategory);

      const filteredCards = [...state.cards]
        .map(card => {
            if (searchText.length > 0){
              if (card.title.toUpperCase()
                .includes(searchText.toUpperCase()) && categories
                .includes(card.category)
                ) return {...card, hidden: false}
            } else {
              if (categories.includes(card.category)) return {...card, hidden: false}
            }
            return {...card, hidden: true}
          }
        );

      state.cards = filteredCards;
    },
    clearFilters: (state) => {
      const clearedFiltersCards = state.cards.map(card => ({
        ...card,
        hidden: false
      }))

      state.cards = clearedFiltersCards;
    }
  }
})

export const { setCards, updateOneCard, filterCards, clearFilters, addCard, setSearchText } = cardsSlice.actions;

export default cardsSlice.reducer;