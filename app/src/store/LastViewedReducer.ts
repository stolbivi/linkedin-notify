import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {CompleteEnabled} from "./LocalStore";

export interface LastViewed {
    profile: string
    author: string
    createdAt?: string
    updatedAt?: string
    hide?: boolean
}

const initialState: LastViewed = {profile: "", author: ""}

const slice = createSlice({
    name: "lastViewedState",
    initialState,
    reducers: {
        getLastViewedAction: (_1, _2: PayloadAction<string>) => {
        },
        setLastViewedAction: (state, action: PayloadAction<CompleteEnabled<LastViewed>>) => {
            // @ts-ignore
            Object.keys(action.payload).forEach(key => state[key] = action.payload[key]);
        }
    }
});

export const {getLastViewedAction, setLastViewedAction} = slice.actions
export default slice.reducer