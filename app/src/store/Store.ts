import {configureStore, Store} from "@reduxjs/toolkit"
import lastViewedReducer, {LastViewed} from "./LastViewedReducers";
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
}

export const store = configureStore({
    reducer: {
        lastViewed: lastViewedReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export const selectLastViewed = (store: Store<RootState>, id: number) => store.getState().lastViewed[id];