import {configureStore, Store} from "@reduxjs/toolkit"
import lastViewedReducer, {LastViewed} from "./LastViewedReducers";
import showNotesAndChartsReducer, {ShowNotesAndCharts} from "./ShowNotesAndCharts";
import {listenerMiddleware} from "./Listeners";

export interface TabAwarePayload<Payload> {
    tabId: number
    payload: Payload
}

export interface TabAwareState<State> {
    [tabId: number]: State
}

export interface RootState {
    lastViewed: TabAwareState<LastViewed>
    showNotesAndCharts: TabAwareState<ShowNotesAndCharts>
}

export const masterStore = configureStore({
    reducer: {
        lastViewed: lastViewedReducer,
        showNotesAndCharts: showNotesAndChartsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export const selectLastViewed = (store: Store<RootState>, id: number) => store.getState().lastViewed[id];
export const selectShowNotesAndCharts = (store: Store<RootState>, id: number) => store.getState().showNotesAndCharts[id];