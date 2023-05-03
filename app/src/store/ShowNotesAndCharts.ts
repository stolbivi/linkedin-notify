import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IdAwareRequest, IdAwareState} from "./LocalStore";

export interface ShowNotesAndCharts {
    id?: string
    showSalary: boolean
    showNotes: boolean
    show: boolean
}

const initialState: IdAwareState<ShowNotesAndCharts> = {};

const slice = createSlice({
    name: "lastViewedState",
    initialState,
    reducers: {
        showNotesAndChartsAction: (state, action: PayloadAction<IdAwareRequest<ShowNotesAndCharts>>) => {
            state[action.payload.id] = action.payload.state;
        }
    }
});

export const {showNotesAndChartsAction} = slice.actions
export default slice.reducer