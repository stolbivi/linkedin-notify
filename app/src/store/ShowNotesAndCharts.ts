import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {TabAwarePayload, TabAwareState} from "./MasterStore";

export interface ShowNotesAndCharts {
    id?: string
    showSalary: boolean
    showNotes: boolean
}

const initialState: TabAwareState<ShowNotesAndCharts> = {}

const slice = createSlice({
    name: "lastViewedState",
    initialState,
    reducers: {
        setShowNotesAndCharts: (state, action: PayloadAction<TabAwarePayload<ShowNotesAndCharts>>) => {
            state[action.payload.tabId] = action.payload.payload;
        }
    }
});

export const {setShowNotesAndCharts} = slice.actions
export default slice.reducer