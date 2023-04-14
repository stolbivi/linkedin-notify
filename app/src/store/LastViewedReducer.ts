import {createSlice, PayloadAction} from "@reduxjs/toolkit";

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
        setLastViewedAction: (state, action: PayloadAction<LastViewed>) => {
            state.profile = action.payload.profile;
            state.author = action.payload.author;
            state.createdAt = action.payload.createdAt;
            state.updatedAt = action.payload.updatedAt;
            state.hide = action.payload.hide;
        }
    }
});

export const {getLastViewedAction, setLastViewedAction} = slice.actions
export default slice.reducer