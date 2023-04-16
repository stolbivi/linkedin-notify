import {configureStore, createListenerMiddleware} from "@reduxjs/toolkit"
import initListeners from "./Effects";
import lastViewedReducer, {LastViewed} from "./LastViewedReducer";
import showNotesAndChartsReducer, {ShowNotesAndCharts} from "./ShowNotesAndCharts";
import salaryReducer, {Salary} from "./SalaryReducer";
import stageReducer from "./StageReducer";
import {StageResponse} from "../actions";

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
    stage: IdAwareState<CompleteEnabled<StageResponse>>
}

export const localStore = configureStore({
    reducer: {
        lastViewed: lastViewedReducer,
        showNotesAndCharts: showNotesAndChartsReducer,
        salary: salaryReducer,
        stage: stageReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

localStore.subscribe(() => {
    console.log('Local store:', localStore.getState());
})

export const selectLastViewed = (state: RootState) => state.lastViewed;
export const selectShowNotesAndCharts = (state: RootState) => state.showNotesAndCharts;
export const selectSalary = (state: RootState) => state.salary;
export const selectStage = (state: RootState) => state.stage;