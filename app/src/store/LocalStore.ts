import {configureStore, createListenerMiddleware} from "@reduxjs/toolkit"
import lastViewedReducer, {LastViewed} from "./LastViewedReducer";
import showNotesAndChartsReducer, {ShowNotesAndCharts} from "./ShowNotesAndCharts";
import initListeners from "./Effects";
import salaryReducer, {Salary} from "./SalaryReducer";

export const listenerMiddleware = createListenerMiddleware();
initListeners();

export interface Completion {
    completed?: boolean
}

export type CompleteEnabled<T> = Partial<T> & Completion;

export interface IdAwareState<State> {
    [key: string]: State
}

export interface IdAwareRequest<State> {
    id: string
    state: State
}

interface RootState {
    lastViewed: CompleteEnabled<LastViewed>
    showNotesAndCharts: IdAwareState<ShowNotesAndCharts>
    salary: IdAwareState<CompleteEnabled<Salary>>
}

export const localStore = configureStore({
    reducer: {
        lastViewed: lastViewedReducer,
        showNotesAndCharts: showNotesAndChartsReducer,
        salary: salaryReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export const selectLastViewed = (state: RootState) => state.lastViewed;
export const selectShowNotesAndCharts = (state: RootState) => state.showNotesAndCharts;
export const selectSalary = (state: RootState) => state.salary;