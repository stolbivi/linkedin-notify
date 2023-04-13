import {configureStore, PayloadAction, Store} from "@reduxjs/toolkit"
import lastViewedReducer, {LastViewed} from "./LastViewedReducers";
import showNotesAndChartsReducer, {ShowNotesAndCharts} from "./ShowNotesAndCharts";
import {createFromRequest} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../global";
import {propagateRequest} from "./Listeners";
import {TabAwarePayload} from "./MasterStore";

const messages = new MessagesV2(VERBOSE);

messages.listen(createFromRequest<PayloadAction<TabAwarePayload<any>>, void>(propagateRequest,
    (action) => {
        console.debug("Received tab action:", action.payload.tabId, "payload:", action.payload.payload);
        // localStore.dispatch(action);
        return Promise.resolve();
    }));

export interface CompletenessAwareState<State> {
    completed: boolean
    state: State
}

export interface RootState {
    lastViewed: CompletenessAwareState<LastViewed>
    showNotesAndCharts: CompletenessAwareState<ShowNotesAndCharts>
}

export const localStore = configureStore({
    reducer: {
        lastViewed: lastViewedReducer,
        showNotesAndCharts: showNotesAndChartsReducer
    }
});

export const selectLastViewed = (store: Store<RootState>) => store.getState().lastViewed;
export const selectShowNotesAndCharts = (store: Store<RootState>) => store.getState().showNotesAndCharts;