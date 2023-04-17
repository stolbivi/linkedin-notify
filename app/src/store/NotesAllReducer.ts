import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {NoteExtended} from "../global";
import {CompleteEnabled, DataWrapper} from "./LocalStore";

const initialState: CompleteEnabled<DataWrapper<NoteExtended[]>> = {data: []};

const slice = createSlice({
    name: "notesAllState",
    initialState,
    reducers: {
        getNotesAction: (_1, _2: PayloadAction) => {
        },
        setNotesAction: (state, action: PayloadAction<CompleteEnabled<DataWrapper<NoteExtended[]>>>) => {
            // @ts-ignore
            Object.keys(action.payload).forEach(key => state[key] = action.payload[key]);
        }
    }
});

export const {getNotesAction, setNotesAction} = slice.actions
export default slice.reducer