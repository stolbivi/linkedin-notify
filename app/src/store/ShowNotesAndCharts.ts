import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface ShowNotesAndCharts {
    id?: string
    showSalary: boolean
    showNotes: boolean
    show: boolean
}

const initialState: ShowNotesAndCharts = {showSalary: false, showNotes: false, show: false};

const slice = createSlice({
    name: "lastViewedState",
    initialState,
    reducers: {
        showNotesAndChartsAction: (state, action: PayloadAction<ShowNotesAndCharts>) => {
            state.id = action.payload.id;
            state.showSalary = action.payload.showSalary;
            state.showNotes = action.payload.showNotes;
            state.show = action.payload.show;
        }
    }
});

export const {showNotesAndChartsAction} = slice.actions
export default slice.reducer