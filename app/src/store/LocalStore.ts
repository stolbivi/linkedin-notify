import {configureStore, createListenerMiddleware} from "@reduxjs/toolkit"
import lastViewedReducer, {getLastViewedAction, LastViewed} from "./LastViewedReducer";
import showNotesAndChartsReducer, {ShowNotesAndCharts} from "./ShowNotesAndCharts";
import completionReducer, {Completion} from "./CompletionReducer";
import initListeners from "./Effects";

export const listenerMiddleware = createListenerMiddleware();
initListeners();

interface RootState {
    lastViewed: LastViewed
    showNotesAndCharts: ShowNotesAndCharts
    completion: Completion
}

export const localStore = configureStore({
    reducer: {
        lastViewed: lastViewedReducer,
        showNotesAndCharts: showNotesAndChartsReducer,
        completion: completionReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export const selectLastViewed = (state: RootState) => state.lastViewed;
export const selectLastViewedCompletion = (state: RootState) => state.completion[getLastViewedAction.type];
export const selectShowNotesAndCharts = (state: RootState) => state.showNotesAndCharts;