import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {CompleteEnabled, IdAwareState} from "./LocalStore";
import {GeoTz} from "../actions";

const initialState: IdAwareState<CompleteEnabled<GeoTz>> = {};

const slice = createSlice({
    name: "geoTzState",
    initialState,
    reducers: {
        getGeoTzAction: (_1, _2: PayloadAction<string>) => {
        },
        setGeoTzAction: (state, action: PayloadAction<CompleteEnabled<GeoTz>>) => {
            // @ts-ignore
            Object.keys(action.payload).forEach(key => state[key] = action.payload[key]);
        }
    }
});

export const {getGeoTzAction, setGeoTzAction} = slice.actions
export default slice.reducer