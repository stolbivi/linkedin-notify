import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {TabAwarePayload, TabAwareState} from "./Store";

export interface LastViewed {
    profile: string
    author: string
    createdAt?: string
    updatedAt?: string
    hide?: boolean
}

const initialState: TabAwareState<LastViewed> = {}

const lastViewedSlice = createSlice({
    name: "lastViewedState",
    initialState,
    reducers: {
        setLastViewed: (state, action: PayloadAction<TabAwarePayload<LastViewed>>) => {
            state[action.payload.tabId] = action.payload.payload;
        }
    }
});

export const {setLastViewed} = lastViewedSlice.actions
export default lastViewedSlice.reducer