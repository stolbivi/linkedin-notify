import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface ShowNotesAndCharts {
    id?: string
    showSalary: boolean
    showNotes: boolean
}

const initialState: ShowNotesAndCharts = {showSalary: false, showNotes: false};

const slice = createSlice({
    name: "lastViewedState",
    initialState,
    reducers: {
        setShowNotesAndCharts: (state, action: PayloadAction<ShowNotesAndCharts>) => {
            state.id = action.payload.id;
            state.showSalary = action.payload.showSalary;
            state.showNotes = action.payload.showNotes;
        }
    }
});

export const {setShowNotesAndCharts} = slice.actions
export default slice.reducer