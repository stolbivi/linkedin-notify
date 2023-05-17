import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import ICard from "../injectables/dashboard/Kanban/interfaces/ICard";
import {IdAwareRequest, IdAwareState} from "./LocalStore";

export interface ShowNotesAndCharts {
    id?: string
    showSalary: boolean
    showNotes: boolean
    show: boolean
    card?: ICard
}

const initialState: IdAwareState<any> = {};

const slice = createSlice({
    name: "lastViewedState",
    initialState,
    reducers: {
        showNotesAndChartsAction: (state, action: PayloadAction<IdAwareRequest<ShowNotesAndCharts>>) => {
            state[action.payload.id] = action.payload.state;
            state["profileId"] = action.payload.state.id;
        }
    }
});

export const {showNotesAndChartsAction} = slice.actions
export default slice.reducer