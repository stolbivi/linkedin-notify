import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {CompleteEnabled, IdAwareRequest, IdAwareState} from "./LocalStore";
import {GetStagesPayload, SetStagePayload} from "../actions";

export interface Stage {
    stage?: number,
    stageText?: string
}

const initialState: IdAwareState<CompleteEnabled<Stage>> = {};

const slice = createSlice({
    name: "stageState",
    initialState,
    reducers: {
        getStageAction: (_1, _2: PayloadAction<IdAwareRequest<GetStagesPayload>>) => {
        },
        getLatestStageAction: (_1, _2: PayloadAction<IdAwareRequest<GetStagesPayload>>) => {
        },
        setStageAction: (state, action: PayloadAction<IdAwareRequest<CompleteEnabled<Stage>>>) => {
            if (!state[action.payload.id]) {
                state[action.payload.id] = {};
            }
            // @ts-ignore
            Object.keys(action.payload.state).forEach(key => state[action.payload.id][key] = action.payload.state[key]);
        },
        updateStageAction: (_1, _2: PayloadAction<IdAwareRequest<SetStagePayload>>) => {
        },
    }
});

export const {getStageAction, getLatestStageAction, setStageAction, updateStageAction} = slice.actions
export default slice.reducer