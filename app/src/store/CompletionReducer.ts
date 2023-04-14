import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface Completion {
    [key: string]: boolean
}

export interface CompletionRequest {
    key: string
    value: boolean
}

const initialState: Completion = {}

const slice = createSlice({
    name: "completionState",
    initialState,
    reducers: {
        setCompletionAction: (state, action: PayloadAction<CompletionRequest>) => {
            state[action.payload.key] = action.payload.value;
        }
    }
});

export const {setCompletionAction} = slice.actions
export default slice.reducer