import { createSlice } from "@reduxjs/toolkit";

import mockColumns from "../../src/injectables/dashboard/Kanban/data/columns";
import IColumn from "../../src/injectables/dashboard/Kanban/interfaces/IColumn";
import IStatus from "../../src/injectables/dashboard/Kanban/interfaces/IStatus";

interface ColumnsSliceState {
  columns: IColumn[],
  updatedColumns: IColumn[] | undefined
}

const initialState: ColumnsSliceState = {
  columns: mockColumns,
  updatedColumns: undefined
}

export const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    setColumns: (state, action) => {
      state.columns = action.payload;
     },
     updateColumns: (state, action) => {

      const cardId = action.payload

      const column = state.columns.find(item => item.id === IStatus.AVAILABILITY)
  
      const columns = state.columns.filter(item => item.id !== IStatus.AVAILABILITY)

      if(column) {
        const updatedColumn = {
          ...column,
          cardsIds: [...column.cardsIds, cardId]
        }
  
        state.columns = [updatedColumn, ...columns]
      }
    }
  }
})

export const { setColumns, updateColumns } = columnsSlice.actions;

export default columnsSlice.reducer;